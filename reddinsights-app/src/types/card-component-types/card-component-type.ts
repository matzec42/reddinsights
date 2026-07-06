// card-component-type.ts

// analysis data object returned from backend for Card, SavedCard components
export interface AnalysisType {
    _id: string;
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
    };
    topThemes: { theme: string; quote: string }[];
};


// comment object type for rendering commment data in CommentsList 
export interface StructuredComment {
    subreddit: string;
    post: string;
    created: string;
    score: number;
    relevance: number;
    comment: string;
    permalink: string;
}

export interface CommentsListProps {
    comments: StructuredComment[];
}


// types for prop passing 
export interface CardProps {
    analysis: AnalysisType;
    subreddits: string[];
    comments: StructuredComment[];
}

export interface SavedCardProps {
    analysis: AnalysisType;
    subreddits: string[];
    comments: StructuredComment[];
}
