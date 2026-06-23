"use client"

import { useState } from 'react';

interface CommentsListProps {
    comments: string[];
}

interface ParsedComment {
    subreddit: string;
    post: string;
    score: string;
    relevance: string;
    comment: string;
}

// parsing function for comments list --- regex extracts by label on the formatted data, returns an object with each part as a key
const parseComment = (raw: string): ParsedComment => {
    const extract = (label: string) => {
        const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\s*(SUBREDDIT|POST|COMMENT SCORE|RELEVANCE|COMMENT):|$)`);
        const match = raw.match(regex);
        return match ? match[1].trim() : "";
    };

    return {
        subreddit: extract("SUBREDDIT"),
        post: extract("POST"),
        score: extract("COMMENT SCORE"),
        relevance: extract("RELEVANCE"),
        comment: extract("COMMENT"),
    };
};

const PAGE_SIZE = 10;

const CommentsList: React.FunctionComponent<CommentsListProps> = ({ comments }) => {
    // state vars for pagination
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    
    // parses for comments only --- posts that are relevant are also analyzed on backend and sent to frontend, but this filters for just comments
    const parsed = comments
    .filter((c) => c && c.trim().length > 0)
    .map(parseComment)
    .filter((c) => c.subreddit && c.comment);

    // variables for pagination
    const visibleComments = parsed.slice(0, visibleCount);
    const hasMore = visibleCount < parsed.length;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
            <h3 className="font-semibold text-xl mb-4">
                Reddit Comments ({parsed.length})
            </h3>

            <ul className="space-y-4">
                {visibleComments.map((c, index) => (
                    <li key={index} className="border border-gray-100 rounded-lg p-4">
                        <p className="text-sm text-orange-600 font-medium mb-1">r/{c.subreddit.replace(/^r\//, "")}</p>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-3">{c.post}</p>
                        <p className="text-xs text-gray-400 mb-2">
                            Score: {c.score} &middot; Relevance: {c.relevance}
                        </p>
                        <p className="text-gray-700">{c.comment}</p>
                    </li>
                ))}
            </ul>

            {hasMore && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="px-5 py-2 rounded-lg text-white font-bold bg-orange-600 hover:bg-orange-500"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentsList;