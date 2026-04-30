// logic to query Reddit API w/ users search term

import { NextResponse } from "next/server";
import { groqCall } from '@/utils/groq-api-helpers';
import { analysisConfigs } from "@/lib/analysisConfigs";
import snoowrap from "snoowrap";

// logic to query RedditAPI
// using Snoowrap library as a wrapper to do this more cleanly
const redditRequest = new snoowrap({
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    userAgent: process.env.REDDIT_USER_AGENT || 'my default user agent'
});

// to avoid type issues with Listing returns from Reddit API
redditRequest.config({ proxies: false });


// function to query the RedditAPI, perform AI analysis
export async function POST(request: Request) {
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
        const cleanQuery = query.trim().replace(/[^a-zA-Z0-9_-]/g, "");

    
        /* First AI API call --- cheap call to fetch relevant subreddit titles */
        // Groq API call (returns a JSON string)
        const subredditList = await groqCall({
            prompt: config.subredditPrompt(cleanQuery),
            model: config.modelSubreddit,
            temperature: config.temperature,
            systemPrompt: "You are a helpful assistant that returns only JSON arrays of subreddit names, no explanations, and no other output."
        });

        // type safety --- parse the fetched Listing of subreddit titles
        let getSubreddits: string[] = [];

        try {
            getSubreddits = JSON.parse(subredditList);
            console.log("Parsed subreddit list:", getSubreddits);
        } catch (err) {
            console.error("Failed to parse subreddit response:", subredditList, {
                error: err,
                raw: subredditList
            });
            return NextResponse.json({
                success: false,
                raw: subredditList
            }, { status: 500 });
        }
        

        // **TO-DO**: edge case / error handling for empty array (no relevant subreddits found) ... after the first prompt, it's possible it could be empty
        
        // Various options for how to query Reddit API ---  Snoowrap functions (getTop w/ a time option) to fetch Top or Hot comments for threads
        
        // FUTURE WORK --- quality of fetched comments isn't always great / relevant...
        // why? e.g., why can't I get the posts that are on the front page of the /r/Nordstrom1901 (ANSWER: proprietary Reddit thing, regular joes don't get access to the latest & greatest...)
        // consider tracking/looking at subreddit URLs on fetched replies --> for second API query, prompt it to focus on most relevant and focus on customer sentiment only (not employees, ads, etc.). See Groq AI Docs --> Prompting Guide
        // expandReplies() to a certain depth perhaps?  more expensive Reddit calls...
        // also need to account for popular / hot topics, too many or too long of comment threads -> too many tokens for second Groq call of analysis (array is too large). Limit comments by string length?
        // implement hueristics to select certain number of comments, comment length, or with certain keywords (?) to improve relevance, quality for analysis 
        

        /* Reddit API call --- returns a Listing of values (see Reddit, Snoowrap docs) */
        // FUTURE WORK: add to /utils to modularize
        const fetchReplies = async () => {
            const allReplies: Array<string> = [];
            for (const sub of getSubreddits) {
                try {
                    // Reddit API returns lazy-loaded Listings
                    const listing = await redditRequest
                        .getSubreddit(sub)
                        .search({
                            query: cleanQuery,
                            sort: "relevance",
                            time: "month",
                        });

                    // copy Listing in brackets to make it an iterable array
                    for (const post of [...listing]) {
                        if (post.selftext && post.selftext.trim() !== "") {
                            // console.log(`Post from r/${sub}:`, post.title);
                            allReplies.push(post.selftext);
                        }
                    }
                
                } catch (err) {
                    // for private, banned or removed/non-existent Subreddits (getting 403, 404 errors)
                    if (err instanceof Error) {
                        console.warn(`Skipping r/${sub} due to error:`, err.message);
                    } else {
                        console.warn(`Skipping r/${sub} due to unknown error:`, err);
                    }
                    continue;
                }
            }
            return allReplies
        };


        /* Structured Compression --- Filtering/Normalizing (.filter), Capping (.slice), Formatting (.map w/ .join) */
        const redditReplies = await fetchReplies();
        // cleaner way to normalize/filter/slice comments array --- one chain
        const formattedReplies = redditReplies
            .filter(r => typeof r === "string" && r.trim().length > 20)
            .slice(0, config.maxComments)
            .map((r, i) => `Comment ${i + 1}: ${r.trim()}`)
            .join("\n\n---\n\n");


        // **TO-DO**: error handling for empty erray (no comments able to be fetched) --- consider early return + error, re-prompt user on frontend


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

        // NOTE: parse error can occur because of incomplete string (i.e., if it's too long). Manage by:
            // adjusting maxTokens in the Groq API call (see utils/groq-api-helpers.ts)
            // adjust # of comments in formattedReplies (see config.maxComments in lib/analysisConfigs.ts)
            // adjust/limit length of comments in the formatting step above (e.g., .slice(0, config.maxComments) or filter out longer comments in the .filter step)
        const parsedAnalysis = JSON.parse(cleanedAnalysis);
        console.log("Parsed analysis object:", parsedAnalysis);


        // NOTE RE:responses --- Next.js requires native Response object to be returned
        // but you can define a custom JSON object to be returned as well
        // define result object first, wrap it in NextResponse
        // status codes, headers, etc. a part of options object (second obj)
        const result = {
            success: true,
            message: "Fetch successful",
            data: parsedAnalysis
        }

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error("Error in the RedditAPI route:", error);

        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}