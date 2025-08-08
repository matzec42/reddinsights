// logic to query Reddit API w/ users search term
// look into Snoowrap --- JS library for interacting w/ the Reddit API
// normalize search, make it a param in Reddit API query
// fetch top 3-5 threads from Subreddit with top comments (based on upvotes or relevance)
// pass fetched data to the AI API

import snoowrap, { Listing } from 'snoowrap';
import { ReddinsightsSchema } from '@/lib/models';

// logic to query RedditAPI --- include Authorization
// using Snoowrap library (already npm installed) as a wrapper to do this more cleanly
const redditRequest = new snoowrap({
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    userAgent: process.env.REDDIT_USER_AGENT || 'my default user agent'
});

// function to query the RedditAPI
export async function POST(request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { query } = body;
        // sanitize the query (e.g., no apostrophes), Subreddits only contain letters, numbers and underscores
        const cleanQuery = query.trim().replace(/[^a-zA-Z0-9_-]/g, "");

        // query the RedditAPI with Snoowrap function to find a valid Subreddit
        // searchSubreddits function will find either the intended or a relevant subreddit, or where ones where search term is mentioned (e.g., Nordstrom --> the actual Nordstrom1901 Subreddit; Nordstom Anniversary --> frugalmalefashion Subreddit; but, Nordstrom Anniversary Sale --> returns undefined, sometimes throws a 500 error)
        // query returns an array of strings (subreddit names)
        const foundSubreddit = await redditRequest.searchSubreddits({ query: cleanQuery });
        // console.log("Found Subreddit, display name:", foundSubreddit[0].display_name);

        let subRedditName;

        // meant to grab related subreddits, but not functioning hitting this --- relatedSubreddits does not work, returns an empty array
        // Listing from Reddit API (by way of Snoowrap) is not a traditional array/object 
        if (!foundSubreddit.length) {
            const relatedSubreddits = await redditRequest.searchSubreddits({
                query: cleanQuery,
                limit: 5
            });
            console.log("Related subs:", relatedSubreddits);
            
            const subredditOptions = relatedSubreddits.map(sub => ({
                name: sub.display_name,
                title: sub.title,
                description: sub.public_description,
                subscribers: sub.subscribers
            }));
            return new Response(JSON.stringify({
                success: false,
                message: `No exact subreddit found for "${query}"`,
                suggestions: subredditOptions
            }), { status: 200 });
        }

        if (foundSubreddit) {
            subRedditName = foundSubreddit[0].display_name;
        }

        // query the RedditAPI with Snoowrap function
        // testing for now --- see about using the Subreddit class and search with options in Snoowrap
        const threads = await redditRequest.getHot(subRedditName, { limit: 5 });
        const threadTitles = threads.map(thread => {
            return thread.title;
        });

        // note on responses --- Next.js requires native Response object to be returned
        // but you can define a custom JSON object to be returned as well
        // define result object first, wrap it in Response
        // status codes, headers, etc. a part of options object (second obj)
        const result = {
            success: true,
            message: "Fetch successful",
            data: threadTitles
        }

        console.log("Logging fetched data in Reddit API route:", result.data);

        return new Response(JSON.stringify(result), { status: 200 });

    } catch (error) {
        console.error("Error in the RedditAPI route:", error);

        return new Response(JSON.stringify({
            success: false,
            message: "Something went wrong."
        }), { status: 500 })
    }
}