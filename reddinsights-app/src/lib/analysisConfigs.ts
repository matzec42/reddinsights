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

// TO-DO: experiment with config options (tokens, temperature) for the differents types; simplify/reduce directions without sacrificing quality of AI output; even try different models
    // using more efficient model (8b-instant) for the basic task of finding subreddits --- less expensive
    // using more powerful model (70b-versatile) for the actual analysis of the comments --- more expensive, but want higher quality output for the analysis

export const analysisConfigs: Record<string, AnalysisConfig> = {
    /* General Analysis Config */
    general: {
        subredditPrompt: (query) => `
            Find 5 public Reddit communities that are most likely to contain detailed, first-hand user discussions and opinions directly about ${query}. Prioritize communities where:
                - Most posts are user-generated (not news or memes).
                - Posts focus mostly on customer reviews, experiences and sentiments.
                - The community is active (recent posts within the last month).
            If the query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901, etc.), make sure it gets included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"]
        `,

        analysisPrompt:(query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `You are a sentiment analysis engine.

            Here are is an array of replies from Reddit about "${query}".
            Analyze the following Reddit comments: ${promptData}.

            Return JSON with keys:
            - analysisTitle
            - commentCount
            - generalSummary
            - sentimentSummary
            - topThemes (3-4 top themes)
            
            Here is an example response:
                {
                    analysisTitle: string,
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
            Find 5 public Reddit communities that are focused on brand perception in first-hand user discussions about "${query}". Prioritize communities where:
                - Most posts are user-generated (not news or memes).
                - Posts focus mostly on customer reviews, product reviews, complaints, comparisons.
                - The community is active (recent posts within the last month).
            If the query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901, etc.), make sure it gets included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
            Return ONLY JSON array.
        `,

        analysisPrompt: (query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            You are a brand analyst.

            Analyze customer perception of "${query}" using: ${promptData}.

            Focus on:
            - pricing perception
            - product quality
            - brand sentiment
            - competitor mentions

            Return JSON with keys:
            - analysisTitle
            - generalSummary (focus on customer perception of brand)
            - sentimentSummary
            - topThemes (top 3-4 themes)

            Here is an example response:
                {
                    analysisTitle: string,
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
        Find 5 public Reddit communities that where students have first-hand discussions about "${query}". Prioritize communities where:
            - Most posts are user-generated (not news or memes).
            - Posts focus mostly on customer reviews, product reviews, complaints, comparisons.
            - The community is active (recent posts within the last month).
        If the query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901, etc.), make sure it gets included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
        Return ONLY JSON array.
    `,

        analysisPrompt: (query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
        You are a sentiment analyst.

            Analyze student perception and disucssion of "${query}" using: ${promptData}.

            Focus on:
            - student experiences
            - trends
            - usage patterns
            - affordability

            Return JSON with keys:
            - analysisTitle
            - generalSummary
            - sentimentSummary
            - topThemes (top 3-4 themes)

            Here is an example response:
                {
                    analysisTitle: string,
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