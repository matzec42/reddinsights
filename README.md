# reddinsights
An AI-powered analyzer of Reddit discussions and comments with simple visualizations.

Curious about netizen sentiment about a topic? Simply **enter a search term OR a subreddit topic** into the analyzer and click one of the analysis buttons.

You'll receive an **AI-powered analysis** that will summarize the overall sentiment of Reddit discussion, keywords that reflect where the discussion is trending, and a handful of targeted insights which can help inform your next actions & decisions.

## What It Does (So Far)
- Users can search for insights on a topic with either a general query (e.g., McDonalds value menu) or by searching for a specific subreddit (e.g., r/McDonalds)

![Search flow](./assets/enter-search.gif)

- Reddinsights uses AI to discover relevant subreddits, retrieve and rank comments from active posts in these subreddits (based on Reddit user upvotes, keyword relevance)
- Reddinsights performs an LLM-powered  analysis utilizing this data, presenting things like a general summary, top discussion themes with supporting comments, visualization of Reddit user sentiment, and links to the subreddits---all in an easy-to-read card display

![Card creation](./assets/analysis-card.gif)

- Users can also show/hide the comments that were aggregated and used for the analysis to get a direct look at what informed the AI's results

![Show comments](./assets/show-comments.gif)

- Basic save and delete functionality (CRUD)

![Save functionality](./assets/save-sentiment)

- Quick data retrieval with document-based storage (MongoDB)
- Session-based authentication (email and password), encrypted with bcrypt
- In-memory caching (short-lived to balance efficiency with data freshness/new Reddit discussion)
- Rate limiting with a cloud-based Upstash/Redis instance

## Usage --- Try It Live

Go to: [URL to go here]

**Demo Account:**
- Email: demo@reddinsights.app
- Password: demo123!

Or create your own account.


## Local Set Up
**Requirements:** Next.js, Groq AI API key, Reddit account and API credentials (client ID, secret), a MongoDB cluster.

1. Clone the repo
2. `npm install`
3. cd into `reddinsights-app` folder
4. Create a `.env.local` file and fill in your own keys (see below)
5. `npm run dev`

### Required Environment Variables

**Strongly recommended** to try the app with the **demo account (see above)**, given recent revisions to Reddit's API usage and developer policies (details @ https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy). But for running locally:

- `GROQ_API_KEY` - get one for free at https://console.groq.com/home 
- `MONGODB_URI` - a connection string for a MongoDB cluster
- `REDDIT_USERNAME` and `REDDIT_PASSWORD` - sign-in credential for a Reddit account
- `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` - create/register a Reddit app at www.reddit.com/prefs/apps or old.reddit.com/prefs/apps. **Note:** Reddit's Responsible Builder Policy (as of 2026) may require approval for new API access (see link above)
- `REDDIT_USER_AGENT` - a string identifying your app to Reddit's API
    - Format: `platform:app_id:version (by /u/your_username)`
    - Example: `reddinsights:v1.0 (by /u/your_reddit_username)`
    - Just replace `your_reddit_username` with the Reddit account you're using above. (Reddit's API rules require a unique identifiable string.)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` - get for free at https://console.upstash.com/auth/sign-in (needed for rate-limiting)
- `NEXT_PUBLIC_BASE_URL` - set to `http://localhost:3000` for local development


## Stack

- Next.js, Groq AI, Recharts, MongoDB, Snoowrap (JS library for Reddit API), Upstash/Redis
