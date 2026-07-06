// Logic to query RedditAPI with Snoowrap
import snoowrap from "snoowrap";
import { normalizeText } from "./text-normalizer";

// manually fetch a Reddit access token using the Reddit API, then use it to create a Snoowrap client instance
// Snoowrap was failing to do this automatically, so this is a workaround to get valid Reddit API token
async function getRedditClient() {
    const credentials = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': process.env.REDDIT_USER_AGENT || 'reddinsights/1.0'
        },
        body: `grant_type=password&username=${process.env.REDDIT_USERNAME}&password=${process.env.REDDIT_PASSWORD}`
    });

    const data = await response.json();

    return new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT || 'reddinsights/1.0',
        accessToken: data.access_token
    });
}


// using Snoowrap library as a wrapper to do this more cleanly
// const redditRequest = new snoowrap({
//     clientId: process.env.REDDIT_CLIENT_ID,
//     clientSecret: process.env.REDDIT_CLIENT_SECRET,
//     username: process.env.REDDIT_USERNAME,
//     password: process.env.REDDIT_PASSWORD,
//     userAgent: process.env.REDDIT_USER_AGENT || 'my default user agent'
// });

// to avoid type issues with Listing returns from Reddit API
// redditRequest.config({ proxies: false });

// variables for post & comment extraction, filtering, sorting --- fine tune these depending on comment quality
const TOP_POSTS = 7;
const MAX_COMMENTS_PER_POST = 10;
const MIN_SCORE = 3;


export const getRedditReplies = async (fetchedSubreddits: string[], cleanQuery: string, config: string) => {
    // invoke getRedditClient to give Snoowrap a valid token before querying Reddit API
    const redditRequest = await getRedditClient();

    // helper function to convert cleanQuery (for Reddit API querying) to useable format for keyword matching
    const queryWords = cleanQuery.replace(/\+/g, ' ').toLowerCase().split(' ').filter(w => w.length > 0);

    // initializing the array to collect most relevant posts and ranked comments (including both for more stable/reliable context for LLM)
    // function populates and returns this @ end
    const allReplies: Array<string> = [];
    
    // array to hold structured comments for frontend display (see CommentsList.tsx)
    // ensures consistency for rendering CommentsList below the Card, SavedCard components (parsing w/ regex is too fragile/prone to bugs, as with the permalink URL formatting from Reddit API)
    const structuredComments: Array<{
        subreddit: string;
        post: string;
        created: string;
        score: number;
        relevance: number;
        comment: string;
        permalink: string;
    }> = [];


    for (const sub of fetchedSubreddits) {
        try {
            // Reddit API returns lazy-loaded Listings (see Reddit, Snoowrap docs)
            // for now, getTop w/ a shorter time window (vs. getNew or getHot --- see docs):
            // getTop --- score filtered, scoped by time | getNew --- true real-time signal, noisier | getHot --- blends recency + score, no time param, can't scope time
            const listing = config === "trending" ?
                await redditRequest.getSubreddit(sub).getTop({ time: "day" })
                :
                await redditRequest
                    .getSubreddit(sub)
                    .search({
                        query: cleanQuery,
                        sort: "relevance",
                        time: "month",
                    });

            // copy Listing to make it an iterable array
            const postsArray = [...listing].slice(0, TOP_POSTS);
            console.log(`r/${sub}: ${postsArray.length} posts found`);

            for (const post of postsArray) {
                if (post.selftext && post.selftext.trim() !== "") {

                    // sanitize post titles (since they are pushed into the allReplies array)
                    const cleanPostTitle = normalizeText(post.title);
                    const cleanPostSelfText = normalizeText(post.selftext);

                    // push post's title plus its selftext (i.e., the post's first comment); formatting it for better LLM analysis
                    allReplies.push(`
                        TITLE: ${cleanPostTitle}\nBODY: ${cleanPostSelfText}`);
                }

                // capture top comments (try/catch and console.warn so it doesn't kill the whole loop)
                // suppressing the eslint rule against using any type here --- Snoowrap TS types are throwing errors (a known problem w/ the library)
                try {
                    // fetch top-level comments --- consider expanding if it would capture sentiment better / improve analysis quality
                    // filtering comments --- score
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const comments = await (post.expandReplies({ depth: 1, limit: MAX_COMMENTS_PER_POST }) as any);

                    const topComments = comments.comments
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((comment: any) => comment.body && comment.body.trim() !== "")
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((comment: any) => comment.score >= MIN_SCORE)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((comment: any) => {
                            const cleanBody = normalizeText(comment.body);

                            const relevanceScore = queryWords.filter(word => cleanBody.includes(word)).length;
                            return { ...comment, body: cleanBody, relevanceScore };
                        })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore || b.score - a.score)
                        .slice(0, MAX_COMMENTS_PER_POST);

                    for (const comm of topComments) {
                        // sanitizing sub as well
                        const cleanSub = normalizeText(sub);

                        // push string-formatted comments to LLM for analysis
                        allReplies.push(`
                                SUBREDDIT: r/${cleanSub}
                                \nPOST: ${normalizeText(post.title)}
                                \nCOMMENT SCORE: ${comm.score}
                                \nRELEVANCE: ${comm.relevanceScore}
                                \nCOMMENT: ${comm.body}
                            `);
                        
                        // push structured comment objects to array for frontend display (CommentsList.tsx)
                        structuredComments.push({
                            subreddit: cleanSub,
                            post: normalizeText(post.title),
                            created: new Date(comm.created_utc * 1000).toLocaleString(),
                            score: comm.score,
                            relevance: comm.relevanceScore,
                            comment: comm.body,
                            permalink: `https://www.reddit.com${comm.permalink}`,
                        });
                    }

                    // console.log(`Top Comments array in Reddit helper: ${topComments}`);

                } catch (err) {
                    console.warn(`Could not expand comments for post ${post.id}:`, err instanceof Error ? err.message : err);
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

    return { allReplies, structuredComments };
};


// √ Upvote threshold --- filter out comments below a minimum score to improve quality
// √ Keyword relevance scoring to prioritize comments that contain the search query terms
// √ Expose fetched comments to the user on the frontend so they can see quality and refine their search (see generate-analysis/route.ts, data is sent w/ response to frontend now)

// **FUTURE WORK:** explore various options for how to query Reddit API ---  Snoowrap functions (getTop w/ a time option) to fetch Top or Hot comments for threads
// For now, getTop({ time: "day" }) yields a "real-time" signal, but consider experimenting with others later (see notes in try/catch above)
// Continue to monitor LLM models --- llama-instant was decomissioned in June 2026, had to modify (see analysisConfigs.ts file)