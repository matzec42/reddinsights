# reddinsights
An AI-powered analyzer of Reddit subreddits and comments aggregator with simple visualizations.

Curious about netizen sentiment about a topic? Simply enter a search term OR a subreddit topic (e.g., /McDonalds) into the analyzer and click one of the analysis buttons.

You'll receive an AI-powered analysis that will summarize the overall sentiment of Reddit discussion, keywords that reflect where the discussion is trending, and a handful of targeted insights which can help inform your next actions & decisions.

## What It Does (So Far)
- Users can search for insights on a topic with either a general query (e.g., McDonalds value menu) or by searching for a specific subreddit (e.g., r/McDonalds)
- Reddinsights uses AI to discover relevant subreddits, retrieve and rank comments from active posts in these subreddits (based on Reddit user upvotes, keyword relevance)
- Reddinsights performs an LLM-powered  analysis utilizing this data, presenting things like a general summary, top discussion themes with supporting comments, visualization of Reddit user sentiment, and links to the subreddits---all in an easy-to-read card display
- Users can also show/hide the comments that were aggregated and used for the analysis to get a direct look at what informed the AI's results
- Basic save and delete functionality (CRUD)
- Quick data retrieval with document-based storage (MongoDB)
- Session-based authentication with email and password
- In-memory caching (short-lived to balance efficiency with data freshness/new Reddit discussion)
- Rate limiting with a cloud-based Upstash/Redis instance

## Set Up
**Requirements:** Next.js, Groq AI API key, Reddit account and API credentials (client ID, secret), a MongoDB cluster.

- ...

## Usage

## Observations

## Stack
