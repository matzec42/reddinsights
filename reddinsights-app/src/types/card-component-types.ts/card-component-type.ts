// card-component-type.ts

export interface AnalysisType {
    _id: string,
    analysisTitle: string;
    createdAt: Date;
    commentCount: number;
    generalSummary: string;
    sentimentSummary: {
        overall: string;
        positive: number;
        negative: number;
        neutral: number;
        distribution: {
            name: string;
            value: string;
        }[];
    }
        topThemes: { theme: string; quote: string }[];
};

export interface CardProps {
    analysis: AnalysisType,
    subreddits: string[];
};