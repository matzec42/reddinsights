// card-component-type.ts

export interface Analysis {
    analysisTitle: string;
    createdAt: Date
    commentCount: number;
    generalSummary: string;
    sentimentSummary: {
        overall: string;
        positive: number;
        negative: number;
        neutral: number;
    };
    topThemes: { theme: string; quote: string }[];
}

export interface CardProps {
    analysis: Analysis;
}