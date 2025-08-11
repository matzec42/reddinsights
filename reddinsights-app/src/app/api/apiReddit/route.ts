// logic to query Reddit API w/ users search term
// REVISED APPROACH / EXPERIMENT:
// AI API call to ensure relevant Subreddits --> Reddit API query for replies (posts & their comments) --> second AI API call for analysis

import { NextResponse } from 'next/server';
import { Groq } from "groq-sdk";
import { GroqApiCallOptions } from '@/types/groq-api-types/groq-types';
import { groqCall } from '@/utils/groq-api-helpers';
import snoowrap from 'snoowrap';
import { ReddinsightsSchema } from '@/lib/models';

// for querying Groq + Llama 3 (good for text-to-text)
const groq = new Groq();

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


// function to query the RedditAPI
export async function POST(request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { query } = body;

        if (!query) return NextResponse.json({
            error: "Missing or invalid search term",
            success: false,
            message: "Please submit a valid search term"
        }, { status: 400 })

        // sanitize the query (e.g., no apostrophes), Subreddits only contain letters, numbers and underscores
        const cleanQuery = query.trim().replace(/[^a-zA-Z0-9_-]/g, "");

        // first AI API call --- prompt with the query to fetch relevant Subreddits
        const groqPromptOne = `Find 3 public Reddit communities that are most likely to contain detailed, first-hand user discussions and opinions directly about "${cleanQuery}". Prioritize communities where:
            - The majority of posts are user-generated (not news or memes).
            - Comments frequently contain personal experiences, reviews, or sentiment.
            - The community is active (recent posts within the last month).
        If the query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901, etc.), make sure it gets included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"]`;

        // Groq API call (returns a JSON string)
        const subredditList = await groqCall({
            prompt: groqPromptOne,
            systemPrompt: "You are a helpful assistant that returns only JSON arrays of subreddit names, no explanations, and no other output."
        });

        // additional type safety parse the fetched Listing
        let getSubreddits: string[] = [];
        try {
            getSubreddits = JSON.parse(subredditList);
            console.log("Parsed subreddit list:", getSubreddits);
        } catch (err) {
            console.error("Failed to parse Groq API response for subreddits:", subredditList);
            return NextResponse.json({
                success: false,
                error: "Groq response was not valid JSON:", err,
                raw: subredditList
            }, { status: 500 });
        }

        // edge case / error handling for empty array ... per the first prompt, it's possible it could be empty

        // query Reddit API ---  Snoowrap function (getTop w/ a time option) to fetch top or hot comments for threads
        // FUTURE WORK --- quality of fetched comments isn't always great / relevant...
        // why?  --- for instance, why can't I get the posts that are on the front page of the /r/Nordstrom1901
        // how to improve? ... right now, it's just grabbing post replies and throwing them into an array
        // consider tracking/looking at subreddit URLs on fetched replies --> for second API query, prompt it to focus on most relevant and focus on customer sentiment only (not employees, ads, etc.). See Groq Docs --> Prompting Guide
        // expandReplies() to a certain depth perhaps?  more expensive Reddit calls
        const fetchedReplies = async () => {
            const allReplies: Array<string> = [];
            for (const sub of getSubreddits) {
                try {
                    // Reddit API returns lazy-loaded listings
                    const listing = await redditRequest
                        .getSubreddit(sub)
                        .search({
                            query: cleanQuery,
                            sort: "relevance",
                            // consider: week, month; or, large time frame (month) and .slice below on postsArray
                            time: "month",
                        });
                    // copy Listing in brackets to make it iterable array
                    const postsArray = [...listing];

                    if (postsArray) {
                        for (const post of postsArray) {
                            if (post.selftext && post.selftext.trim() !== "") {
                                console.log(`Post from r/${sub}:`, post.title);
                                allReplies.push(post.selftext);
                            }
                        }
                        // this expandReplies method isn't working --- issue with the await line
                        // write as separate function, call and push into array as well
                        // for (const post of postsArray) {
                        //     try {
                        //         await post.expandReplies({ depth: 1, limit: 5 });
                        //         post.comments.forEach(comment => {
                        //             if (comment.body && comment.body.trim()) {
                        //                 allReplies.push(comment.body);
                        //             }
                        //         });
                        //     } catch (err) {
                        //         console.warn(`Failed to expand comments for post ${post.id}:`, err);
                        //     }
                        // }
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

        const redditReplies = await fetchedReplies();
        console.log("Comments array:", redditReplies);

        // error handling for empty erray --- consider early return + error, re-prompt user on frontend

        // last AI API call --- analysis of comments (sentiment, #'s of comments, themes & quotations in structured JSON)
        // check / repair format if not in JSON (remember to give it a shape of your Thread document)
        const groqPromptTwo = `Here are is an array of comments from Reddit about ${cleanQuery}. Analyze and classify the sentiment of each comment (positive, negative or neutral) in this array: ${redditReplies}. Then, return a summary of your analysis that includes a short title for the analysis, the total number of comments analyzed, the overall sentiment of the comments (positive, negative, or mixed), and the top 3 themes (single word) each with a quote (partial or full comment) that is representative of that theme. Here is an example for the response:
        { 
            analysisTitle: string (e.g., "Nordstrom Anniversary Sale Analysis"),
            commentCount: number (e.g., 20),
            sentimentSummary: {
                overall: "Mixed" (e.g., Positive, Somewhat Positive, Mixed, Somewhat Negative, Negative)
                positive: number (e.g., 8)
                negative: number (e.g., 6)
                neutral: number (e.g., 6)
            },
            topThemes: [
                { theme: string (e.g., "Great Prices"), quote: string (a comment you analyzed) },
                { theme: string, quote: string }
                { theme: string, quote: string }
            ]
        }`

        const analyzeReplies = await groqCall({
            prompt: groqPromptTwo,
            systemPrompt: "You are a helpful assistant that does customer sentiment analysis and only returns information in JSON format."
        });

        console.log("Returned analysis object from Groq API fetch:", analyzeReplies);

        try {
            console.log("Returned analysis object from Groq API fetch:", analyzeReplies);
        } catch {
            console.error("Failed to parse Groq API response for analysis:", analyzeReplies);
        }

        // note on responses --- Next.js requires native Response object to be returned
        // but you can define a custom JSON object to be returned as well
        // define result object first, wrap it in Response
        // status codes, headers, etc. a part of options object (second obj)

        const result = {
            success: true,
            message: "Fetch successful",
            data: analyzeReplies
        }

        // console.log("Logging fetched data in Reddit API route:", result.data);

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error("Error in the RedditAPI route:", error);

        return NextResponse.json({
            error: error,
            success: false,
            message: "Something went wrong."
        }, { status: 500 })
    }
}