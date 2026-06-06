// Logic to query RedditAPI with Snoowrap
import snoowrap from "snoowrap";

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


export const getRedditReplies = async (fetchedSubreddits: string[], cleanQuery: string) => {
    const allReplies: Array<string> = [];
    for (const sub of fetchedSubreddits) {
        try {
            // Reddit API returns lazy-loaded Listings (see Reddit, Snoowrap docs)
            const listing = await redditRequest
                .getSubreddit(sub)
                .search({
                    query: cleanQuery,
                    sort: "relevance",
                    time: "month",
                });

            // copy Listing to make it an iterable array
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

// **FUTURE WORK:** various options for how to query Reddit API ---  Snoowrap functions (getTop w/ a time option) to fetch Top or Hot comments for threads.
    // Consider experimenting with different options for fetching comments (e.g., top vs hot, time range) to see how it impacts the quality of the insights.
    // For example, top comments from the past month could have more relevant insights than hot comments from all time,
    // which could be dominated by older posts with lots of upvotes.
    // Could implement as an additional option in the frontend for users to select their preferred comment fetching strategy.

// Since comments will be fetched, future work could also include sending them if user requests (e.g., "Click to see comments fetched" so that they can get a sense of quality and modify their next search accordingly)