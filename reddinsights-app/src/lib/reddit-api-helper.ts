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

// variables for post & comment extraction, filtering, sorting --- fine tune these depending on comment quality
const TOP_POSTS = 7;
const MAX_COMMENTS_PER_POST = 10;
const MIN_SCORE = 3;


export const getRedditReplies = async (fetchedSubreddits: string[], cleanQuery: string, config: string) => {

    // helper function to convert cleanQuery (for Reddit API querying) to useable format for keyword matching
    const queryWords = cleanQuery.replace(/\+/g, ' ').toLowerCase().split(' ').filter(w => w.length > 0);

    const allReplies: Array<string> = [];
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
                // console.log(`Post: ${post.title} | selftext length: ${post.selftext?.length}`);
                if (post.selftext && post.selftext.trim() !== "") {
                    // console.log(`Post from r/${sub}:`, post.title);
                    // push post's title plus its selftext (i.e., the post's first comment); formatting it for better LLM analysis
                    allReplies.push(`
                        TITLE: ${post.title}\nBODY: ${post.selftext}`);
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
                            const body = comment.body.toLowerCase();
                            const relevanceScore = queryWords.filter(word => body.includes(word)).length;
                            return { ...comment, relevanceScore };
                        })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore || b.score - a.score)
                        .slice(0, MAX_COMMENTS_PER_POST);

                    for (const comment of topComments) {
                        allReplies.push(`
                                SUBREDDIT: r/${sub}
                                \nPOST: ${post.title}
                                \nCOMMENT SCORE: ${comment.score}
                                \nRELEVANCE: ${comment.relevanceScore}
                                \nCOMMENT: ${comment.body}
                            `);
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

    return allReplies
};

// create a "Trending Topics" mode: sort comments by "new" instead of "top" to capture fast-moving sentiment


// **FUTURE WORK:** explore various options for how to query Reddit API ---  Snoowrap functions (getTop w/ a time option) to fetch Top or Hot comments for threads
    // √ Upvote threshold --- filter out comments below a minimum score to improve quality
    // √ Keyword relevance scoring to prioritize comments that contain the search query terms
    
    // Expose fetched comments to the user on the frontend so they can assess quality and refine their search
        // (e.g., "Click to see comments fetched" so that they can get a sense of quality and modify their next search accordingly)