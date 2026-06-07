// LLM model and prompt configurations for different types of analyses (general, brand insights, student trends)

export type AnalysisType = "general" | "brand" | "student";

type AnalysisConfig = {
    subredditPrompt: (query: string) => string;
    analysisPrompt: (query: string, data: string | string[]) => string;
    systemPrompt: string;
    modelSubreddit: string;
    modelAnalysis: string;
    temperature: number;
    maxComments: number;
};

// **FUTURE WORK**: experiment with config options (tokens, temperature) for the differents types; simplify/reduce directions without sacrificing quality of AI output; even try different models
    // using more efficient model (8b-instant) for the basic task of finding subreddits --- less expensive
    // using more powerful model (70b-versatile) for the actual analysis of the comments --- more expensive, but want higher quality output for the analysis


export const analysisConfigs: Record<string, AnalysisConfig> = {
    /* General Analysis Config */
    general: {
        subredditPrompt: (query) => `
            Find 5 public Reddit communities that are most likely to have detailed, first-hand user discussions about ${query}. Prioritize communities where:
                - Most posts are user-generated (not news or memes).
                - Posts focus on user opinions, experiences and sentiments.
                - The community is active (recent posts within the last month).
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid off-topic or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"]
        `,

        analysisPrompt:(query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            You are a sentiment analysis engine.

            Here discussion from Reddit about "${query}":
            Analyze the following posts and comments: ${promptData}.

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: ${new Date()},
                    commentCount: number,
                    generalSummary: string,
                    sentimentSummary: {
                        overall: string,
                        positive: number,
                        negative: number,
                        neutral: number
                    },
                    topThemes: [
                        { theme: string, quote: string }
                    ]
                }
        `;
        },

        systemPrompt: "Return ONLY valid JSON. No markdown. No backticks.",
        modelSubreddit: "llama-3.1-8b-instant",
        modelAnalysis: "llama-3.3-70b-versatile",
        temperature: 0.3,
        maxComments: 30,
        },

    /* Brand Insights Config */
    brand: {
        subredditPrompt: (query) => `
            Find 5 public Reddit communities that focus on brand perception in user discussions about "${query}". Prioritize communities where:
                - Most posts are user-generated (not news or memes).
                - Posts focus mostly on customer reviews, product reviews, complaints, comparisons.
                - The community is active (recent posts within the last month).
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
            Return ONLY JSON array.
        `,

        analysisPrompt: (query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            You are a brand analyst.

            Analyze customer discussions and perception of "${query}" using: ${promptData}.

            Focus on:
            - brand sentiment
            - product quality
            - pricing perception
            - competitor mentions (names, specific products or services)

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: ${new Date()},
                    commentCount: number,
                    generalSummary: string,
                    sentimentSummary: {
                        overall: string,
                        positive: number,
                        negative: number,
                        neutral: number
                    },
                    topThemes: [
                        { theme: string, quote: string }
                    ]
                }
        `;
        },

    systemPrompt: "Return ONLY valid JSON. No markdown. No backticks.",
    modelSubreddit: "llama-3.1-8b-instant",
    modelAnalysis: "llama-3.3-70b-versatile",
    temperature: 0.3,
    maxComments: 30,
    },

    /* Trending Topics Config */
    // similar to general, but a check for analysis type (in route.ts? reddit-api-helper.ts?) will trigger a different fetch for "hot" comment threads (different than top comments, which the other modes will use)
    trending: {
        subredditPrompt: (query) => `
            Find 5 public Reddit communities that focus on "hot"/currently trending discussions about "${query}". Prioritize subreddits where:
                - Most posts are user-generated (not news or memes).
                - Posts focus mostly on customer reviews, product reviews, complaints, comparisons.
                - The community is active (recent posts within the last month).
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
            Return ONLY JSON array.
        `,

        analysisPrompt: (query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            You are a sentiment analyst.

            Analyze user discussions and perception of "${query}" using: ${promptData}.

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: ${new Date()},
                    commentCount: number,
                    generalSummary: string,
                    sentimentSummary: {
                        overall: string,
                        positive: number,
                        negative: number,
                        neutral: number
                    },
                    topThemes: [
                        { theme: string, quote: string }
                    ]
                }
        `;
        },

    systemPrompt: "Return ONLY valid JSON. No markdown. No backticks.",
    modelSubreddit: "llama-3.1-8b-instant",
    modelAnalysis: "llama-3.3-70b-versatile",
    temperature: 0.3,
    maxComments: 30,
    },

    /* Student Trends Config */
    student: {
        subredditPrompt: (query) => `
            Find 5 public Reddit communities where students have discussions about "${query}". Prioritize communities where:
                - Most posts are user-generated (not news or memes).
                - Posts focus mostly on customer reviews, product reviews, complaints, comparisons.
                - The community is active (recent posts within the last month).
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
            Return ONLY JSON array.
        `,

        analysisPrompt: (query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            Analyze user discussions and perceptions of "${query}" using: ${promptData}.

            Focus on:
            - student experiences
            - student opinions
            - trends
            - behavior patterns
            - affordability

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: ${new Date()},
                    commentCount: number,
                    generalSummary: string,
                    sentimentSummary: {
                        overall: string,
                        positive: number,
                        negative: number,
                        neutral: number
                    },
                    topThemes: [
                        { theme: string, quote: string }
                    ]
                }
        `;
        },
    systemPrompt: "Return ONLY valid JSON. No markdown. No backticks.",
    modelSubreddit: "llama-3.1-8b-instant",
    modelAnalysis: "llama-3.3-70b-versatile",
    temperature: 0.4,
    maxComments: 30,
    }

}