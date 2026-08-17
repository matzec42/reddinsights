/* Main API route for handling Reddit data fetching and AI analysis */

import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis"
import { groqCall } from "@/lib/groq-api-helpers";
import { analysisConfigs } from "@/lib/analysisConfigs";
import { cleanQueryHelper } from "@/lib/clean-query-helper";
import { subredditParser } from "@/lib/subreddit-parser";
import { getRedditReplies } from "@/lib/reddit-api-helper";
import { redditCommentFormatter } from "@/lib/reddit-comment-formatter";

// creates Redis instance
const redis = Redis.fromEnv();

// creates a rate limit instance for Groq AI API calls
// sliding window (looking back from present to avoid fixed window spike)
// params are max # of requests per minute (number), time in seconds for sliding window (string)
const groqLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "ratelimit:groq",
});

// creates a rate limit instance for Reddit API calls
const redditLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "ratelimit:reddit",
});

// simple in-memory caching
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
        // config --- gets assigned the type of whatever analysis was requested (e.g., general, brand, student, etc.)
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



        /* Sanitize query */
        // subreddits only contain letters, numbers and underscores (no apostrophes, punctuation, etc.)
        // for Reddit's API, + symbol is valid search query format (e.g., query of "McDonalds value menu" --> mcdonalds+value+menu)
        const cleanQuery = cleanQueryHelper(query);



        /* Cache Check (in-memory, temporary until DB version is set up) */
        // caching --- create key (clean query + analysis type)
        const cacheKey = `${cleanQuery}-${type}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`Cache hit for: ${cacheKey} | Response time: ${Date.now() - startTime}ms`);
            return NextResponse.json({ success: true, message: "Fetch successful", data: cached.data });
        }



        /* First AI API call --- cheap call to fetch relevant subreddit titles */
        // check Redis to see if limit of Groq calls has been reached
        // set for global (i.e., how much of whole amount of Groq usage is left) and sliding window
        const { success: groqOk1 } = await groqLimiter.limit("global");
        if (!groqOk1) {
            return NextResponse.json({
                success: false,
                message: "High demand on Groq AI right now. Please try again later."
            }, { status: 429 });
        }
        // Groq API call (returns a JSON string)
        const subredditList = await groqCall({
            prompt: config.subredditPrompt(cleanQuery),
            model: config.modelSubreddit,
            temperature: config.temperature,
            reasoningEffort: "low",
            includeReasoning: false,
            systemPrompt: "You are a helpful assistant that returns only JSON arrays of subreddit names, no explanations, and no other output."
        });
        // type safety --- parse the fetched Listing of subreddit titles
        // additional defensive parsing (formatting can be inconsistent)
        let fetchedSubreddits: string[]
        try {
            fetchedSubreddits = subredditParser(subredditList);
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: `Someting went wrong finding subreddits: ${error}`,
                raw: subredditList
            }, { status: 500 });
        }



        /* Reddit API call --- returns an array of comments from the fetched subreddits */
        // invokes Reddit limiter to check Redis, see if rate limit for querying Reddit API has been hit
        const { success: redditOk } = await redditLimiter.limit("global");
        if (!redditOk) {
            return NextResponse.json({
                success: false,
                message: "High demand on Reddit right now. Please try again later."
            }, { status: 429 });
        }
        const { allReplies: redditReplies, structuredComments } = await getRedditReplies(fetchedSubreddits, cleanQuery, type);
        // console.log(`Number of comments/Reddit replies fetched: `, redditReplies.length);

        // error handling for empty array (search was valid/executed b/c subreddits were found and used to query, but no comments were fetched)
        // message on response object gets rendered on frontend
        if (redditReplies.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Hmm, couldn't find Reddit posts for this search. Try modifying your search term(s) or using a different mode (e.g., General)."
            }, { status: 404 });
        }
        // edge case --- insufficient comments in array (AI may hallucinate otherwise)
        if (redditReplies.length < 3) {
            return NextResponse.json({
                success: false,
                message: "Not enough Reddit posts found for a reliable analysis. Try modifying your search term(s) or using a different mode (e.g., General)."
            }, { status: 404 });
        }



        /* Structured Compression --- filtering/normalizing for length (.filter), capping array size (.slice), formatting for the LLM (.map w/ .join) */
        // implemented heuristics to select certain # of comments, control comment length (not too short, max length)
        const formattedReplies = redditCommentFormatter(redditReplies, config.maxComments);



        /* Second AI API call --- Sentiment Analysis (returns a JSON object with analysis results) */
        const { success: groqOk2 } = await groqLimiter.limit("global");
        if (!groqOk2) {
            return NextResponse.json({
                success: false,
                message: "High demand on Groq AI right now. Please try again later."
            }, { status: 429 });
        }
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
            console.error("Failed to get Groq API response for analysis:", analyzedRaw);
        }

        // additional defensive cleaning --- prompt instructions don't always fully resolve this
        // gets rid of JSON and backtick fencing if AI missed it
        const cleanedAnalysis = analyzedRaw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        const parsedFinalAnalysis = JSON.parse(cleanedAnalysis);
        console.log("Final parsed analysis object:", parsedFinalAnalysis);

        // return final result object, subreddit list and comments
        const result = {
            success: true,
            message: "Fetch successful",
            data: [parsedFinalAnalysis, fetchedSubreddits, structuredComments]
        }

        // save finished result of full pipeline run to cache
        cache.set(cacheKey, { data: [parsedFinalAnalysis, fetchedSubreddits, structuredComments], timestamp: Date.now() });

        // console.log(`Full pipeline for: ${cacheKey} | Response time: ${Date.now() - startTime}ms`);

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