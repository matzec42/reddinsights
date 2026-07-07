"use client"

import { useState } from 'react';
import Link from 'next/link';
import { CommentsListProps } from '@/types/card-component-types/card-component-type';


const PAGE_SIZE = 10;

const CommentsList: React.FunctionComponent<CommentsListProps> = ({ comments }) => {
    // state vars for pagination
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const parsed = comments.filter((c) => c && c.subreddit && c.comment && c.comment !== "[deleted]");

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
                        <p className="text-medium text-orange-600 font-medium mb-1">r/{c.subreddit.replace(/^r\//, "")}</p>
                        <p className="text-sm text-gray-500 line-clamp-3">Post Title: {c.post}</p>
                        <p className="text-xs text-gray-400 italic mt-2 mb-2">
                            Created on Reddit: {c.created}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 mb-2">
                            &middot; Reddit Score: {c.score} &middot;
                        </p>
                        <p className="text-gray-700 mb-2 font-medium">{c.comment}</p>
                        <Link
                            href={c.permalink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 text-sm hover:underline inline-flex items-center gap-1"
                        >
                            View Comment in Reddit
                            <img alt="open-in-new-tab" src="/open_in_new.png" className="w-4 h-4" />
                        </Link>
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