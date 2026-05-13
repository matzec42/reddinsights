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

// TO-DO: experiment with config options (tokens, temperature) for the differents types; simplify/reduce directions without sacrificing quality of AI output; even try different models
    // using more efficient model (8b-instant) for the basic task of finding subreddits --- less expensive
    // using more powerful model (70b-versatile) for the actual analysis of the comments --- more expensive, but want higher quality output for the analysis
// TO-DO: along with frontend (AnazlyerPage --> Card), debug the date stamp (inaccurate)

export const analysisConfigs: Record<string, AnalysisConfig> = {
    /* General Analysis Config */
    general: {
        subredditPrompt: (query) => `
            Find 5 public Reddit communities that are most likely to have detailed, first-hand user discussions and opinions about ${query}. Prioritize communities where:
                - Most posts are user-generated (not news or memes).
                - Posts focus on customer reviews, experiences and sentiments.
                - The community is active (recent posts within the last month).
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"]
        `,

        analysisPrompt:(query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            You are a sentiment analysis engine.

            Here are is an array of replies from Reddit about "${query}".
            Analyze the following Reddit comments: ${promptData}.

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: new Date(),
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
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
            Return ONLY JSON array.
        `,

        analysisPrompt: (query, data) => {
            const promptData = Array.isArray(data) ? data.join("\n\n---\n\n") : data;
            return `
            You are a brand analyst.

            Analyze customer perception of "${query}" using: ${promptData}.

            Focus on:
            - brand sentiment
            - product quality
            - pricing perception
            - competitor mentions (names, specific products or services)

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: new Date(),
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
            If query is the name of an existing subreddit (e.g., Amazon, Nordstrom1901), make sure it is included. Only output the subreddit names as a JSON array of strings. Do not include the "r/" prefix. Do not return private or banned subreddits, only publicly available ones. Avoid NSFW, off-topic, or unrelated subreddits. If unsure, return an empty JSON array. Example output: ["AskReddit", "technology", "McDonalds"].
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
            - behavior patterns
            - affordability

            Return JSON with keys:
                {
                    analysisTitle: string,
                    createdAt: new Date(),
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