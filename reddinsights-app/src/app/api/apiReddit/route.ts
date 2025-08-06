// logic to query Reddit API w/ users search term
// look into Snoowrap --- JS library for interacting w/ the Reddit API
    // normalize search, make it a param in Reddit API query
    // fetch top 3-5 threads from Subreddit with top comments (based on upvotes or relevance)
    // pass fetched data to the AI API

import { ReddinsightsSchema } from '@/lib/models';

// function to query the RedditAPI
export async function POST (request: Request) {
    try {
        // parse the req body
        const body = await request.json();
        const { query } = body;

        // console.log(`In the apiReddit route.ts, logging the query:`, query);

        // logic to query RedditAPI --- include Authorization
        // alternatively, look into Snoowrap (already npm installed) as a wrapper to do this more cleanly

    } catch {
        return new Response(JSON.stringify({
            success: false,
            message: "Something went wrong."
        }), { status: 500 })
    }
}
