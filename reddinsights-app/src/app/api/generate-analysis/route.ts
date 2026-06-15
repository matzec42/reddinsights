/* Main API route for handling Reddit data fetching and AI analysis */

import { NextResponse } from "next/server";
import { groqCall } from '@/lib/groq-api-helpers';
import { analysisConfigs } from "@/lib/analysisConfigs";
import { getRedditReplies } from "@/lib/reddit-api-helper";

// simple in-memory caching
// replace w/ DB caching (MongoDB)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60;


// Function to query the RedditAPI, perform AI analysis
export async function POST(request: Request) {
    // dev only --- for checking response time of new analysis vs. fetching cached data
    const startTime = Date.now();

    try {
        // parse the req body
        const body = await request.json();
        const { query, type = "general" } = body;
        const config = analysisConfigs[type];

        // error handling for missing or invalid config type or query
        if (!config) {
            return NextResponse.json({
                error: "Invalid analysis type",
                success: false,
                message: "Please submit a valid analysis type."
            }, { status: 400 });
        }
        if (!query) return NextResponse.json({
            error: "Missing or invalid search term",
            success: false,
            message: "Please submit a valid search term"
        }, { status: 400 })


        // sanitize the query (e.g., no apostrophes). subreddits only contain letters, numbers and underscores
        // for Reddit's API, + symbol is valid search query format (e.g., query of "McDonalds value menu" --> mcdonalds+value+menu)
        // const cleanQuery = query.trim().replace(/[^a-zA-Z0-9_-]/g, "");
        const cleanQuery = query.trim().replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "+");

        /* Cache Check (in-memory, temporary until DB version is set up) */
        // caching --- create key (clean query + analysis type)
        const cacheKey = `${cleanQuery}-${type}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`Cache hit for: ${cacheKey} | Response time: ${Date.now() - startTime}ms`);
            return NextResponse.json({ success: true, message: "Fetch successful", data: cached.data });
        }


        /* First AI API call --- cheap call to fetch relevant subreddit titles */
        // Groq API call (returns a JSON string)
        const subredditList = await groqCall({
            prompt: config.subredditPrompt(cleanQuery),
            model: config.modelSubreddit,
            temperature: config.temperature,
            systemPrompt: "You are a helpful assistant that returns only JSON arrays of subreddit names, no explanations, and no other output."
        });

        // type safety --- parse the fetched Listing of subreddit titles
        // additional defensive parsing (formatting can be inconsistent)
        let fetchedSubreddits: string[] = [];

        try {
            // fetchedSubreddits = JSON.parse(subredditList);
            // console.log("Parsed subreddit list:", fetchedSubreddits);
            const extracted = subredditList.match(/"([^"\n]+)"/g);
            const rawSubreddits = extracted ? extracted.map(s => s.replace(/"/g, '').replace(/\s+/g, '')) : [];
            // edge case handling --- prevents runaway generation (an LLM failure --- the llama model that fetches subreddits has done this)
            fetchedSubreddits = [...new Set(rawSubreddits)].slice(0, 5);
            console.log("Parsed subreddit list:", fetchedSubreddits);
        } catch (error) {
            console.error("Failed to parse subreddit response:", subredditList, {
                error: error,
                raw: subredditList
            });
            return NextResponse.json({
                success: false,
                raw: subredditList
            }, { status: 500 });
        }

        // **TO-DO**: edge case / error handling for empty array (no relevant subreddits found) ... after the first prompt, it's possible it could be empty
        // early exit and response here --- avoids Reddit fetch, second AI API analysis call
        // on frontend, a message to try a new search to yield results


        /* Reddit API call --- returns an array of comments from the fetched subreddits */
        const redditReplies = await getRedditReplies(fetchedSubreddits, cleanQuery);
        console.log(`Number of comments/Reddit replies fetched: `, redditReplies.length);

        // error handling for empty array (search was valid/executed b/c subreddits were found and used to query, but no comments were fetched)
        // message on response object gets rendered on frontend
        if (redditReplies.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No Reddit posts found. Try modifying your search term(s) or using a different mode (e.g., General)."
            }, { status: 404 });
        }
        // edge case --- insufficient comments in array (AI will hallucinate otherwise)
        if (redditReplies.length < 3) {
            return NextResponse.json({
                success: false,
                message: "Not enough Reddit posts found for a reliable analysis. Try modifying your search term(s) or using a different mode (e.g., General)."
            }, { status: 404 });
        }


        // **FUTURE WORK** --- continue improving quality, relevance of fetched comments --> improve sentiment analysis
        // why? e.g., why can't I get the posts that are on the front page of the /r/Nordstrom1901 (ANSWER: proprietary Reddit thing, regular joes don't get access to the latest & greatest...)
        // see Groq AI Docs --> Prompting Guide
        // consider tracking/looking at subreddit URLs on fetched replies --> for second API query, prompt to focus on most relevant & focus on customer sentiment only (not employees, ads, etc.)
        // **KEY** --- current Reddit fetching only captures post selftext, misses much of discussion which lives in comment threads
        // look into implementing expandReplies() in reddit-api-helper (see lib folder) to a certain depth; means more expensive Reddit calls but worth it
        // see notes in /lib/reddit-api-helper !!!


        /* Structured Compression --- filtering/normalizing for length (.filter), capping array size (.slice), formatting for the LLM (.map w/ .join) */
        // implemented hueristics to select certain # of comments, control comment length (not too short, max length)
        const formattedReplies = redditReplies
            .filter(r => typeof r === "string" && r.trim().length > 20 && r.trim().length < 2000)
            .slice(0, config.maxComments)
            .map((r, i) => `Comment ${i + 1}: ${r.trim().slice(0, 1500)}`)
            .join("\n\n---\n\n");
        console.log(`Formatted Reddit comments/replies: ${formattedReplies}`);


        /* Second AI API call --- Sentiment Analysis (returns a JSON object with analysis results) */
        const analyzedRaw = await groqCall({
            prompt: config.analysisPrompt(cleanQuery, formattedReplies),
            model: config.modelAnalysis,
            temperature: config.temperature,
            systemPrompt: config.systemPrompt
        });

        // additional type safety parse the fetched analysis --- this is the object that gets returned to the frontend
        try {
            console.log("Returned analysis object from Groq API fetch:", analyzedRaw);
        } catch {
            console.error("Failed to parse Groq API response for analysis:", analyzedRaw);
        }

        // additional cleaning --- prompt instructions don't always fully resolve this 
        const cleanedAnalysis = analyzedRaw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        // console.log("Cleaned analysis string:", cleanedAnalysis);

        // final parsing analysis
        // NOTE: parse error can occur because of incomplete/truncated string (i.e., if it's too long).
        // mitigate by:
        // adjusting maxTokens in the Groq API call (see lib/groq-api-helpers.ts)
        // adjust # of comments in formattedReplies (see config.maxComments in lib/analysisConfigs.ts)
        // adjust/limit length of comments in the formatting step above (e.g., .slice(0, config.maxComments)
        // see both .trim methods in the .filter and .map steps
        const parsedFinalAnalysis = JSON.parse(cleanedAnalysis);
        // console.log("Parsed analysis object:", parsedFinalAnalysis);


        // NOTE RE:responses --- Next.js requires native Response object to be returned
        // but you can define a custom JSON object to be returned as well
        // define result object first, wrap it in NextResponse
        // status codes, headers, etc. a part of options object (second obj)
        const result = {
            success: true,
            message: "Fetch successful",
            data: [parsedFinalAnalysis, fetchedSubreddits]
        }

        // save finished result of full pipeline run to cache
        cache.set(cacheKey, { data: [parsedFinalAnalysis, fetchedSubreddits], timestamp: Date.now() });

        console.log(`Full pipeline for: ${cacheKey} | Response time: ${Date.now() - startTime}ms`);
        
        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.log(`Error after: ${Date.now() - startTime}ms`);
        console.error("Error in the RedditAPI route:", error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}