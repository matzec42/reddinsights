"use client"

import React, { useEffect } from 'react';
import { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { SavedCardProps } from '../../types/card-component-types.ts/card-component-type';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import CommentsList from '../components/CommentsList'


const COLORS = ['#41cb5b', '#fd4c0b', '#979a9c',];

const SavedCard: React.FunctionComponent<SavedCardProps> = ({ analysis, subreddits, comments }) => {
    // state --- flag for showing Comments List
    const [showComments, setShowComments] = useState(false);

    // invoke useRouter for redirect to dashboard after successful deletion
    const router = useRouter();

    // assigning sentiment data for visualization
    const sentimentData = [
        { name: 'Positive', value: analysis.sentimentSummary.positive },
        { name: 'Negative', value: analysis.sentimentSummary.negative },
        { name: 'Neutral', value: analysis.sentimentSummary.neutral },
    ];

    useEffect(() => {
        setShowComments(true)
    }, []);

    const handleDeleteAnalysis = async () => {
        const id = analysis._id

        try {
            const response = await fetch('/api/delete-analysis', {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })

            if (!response.ok) {
                throw new Error("Failed to delete recipe");
            }

            const data = await response.json();
            console.log("Response: ", data.message);
            alert("Analysis successfully deleted.");
            router.push("/dashboard");

        } catch (err) {
            if (isRedirectError(err)) throw err;
            console.error("Error deleting analysis", err);
            alert("Something went wrong while trying to delete your analysis.");
        }
    }

    // TO-DO: edit data attribute on Pie component --- pull values from sentimentSummary property and convert here, before return
    // LONGER TERM: edit models/DB to store numbers instead of strings, check that storage and usage is consistent in other components (DashboardCard, Card, SavedCard)

    return (
        <div>

            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">

                <Link href="/dashboard">
                    <Image
                        width={20}
                        height={20}
                        alt={"Back button"}
                        src={"/arrow_back.svg"}
                    />
                </Link>

                {/* Header */}
                <div className="mt-3 mb-6">
                    <h2 className="font-bold text-2xl">{analysis.analysisTitle}</h2>
                    <p className="text-sm text-gray-500 mt-1">{new Date(analysis.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Posts & Comments Analyzed: {analysis.commentCount}</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4">

                    {/* Left: Summary, Sentiment Chart */}
                    <div>
                        <p className="font-semibold mb-1">Summary</p>
                        <p className="text-gray-700 mb-6">{analysis.analysisTitle}</p>
                        <p className="font-semibold mb-2">Overall Sentiment: {analysis.sentimentSummary.overall.charAt(0).toUpperCase() + analysis.sentimentSummary.overall.slice(1)}</p>
                        <PieChart width={500} height={300} className="mx-auto">
                            <Pie
                                data={sentimentData}
                                cx={250}
                                cy={130}
                                outerRadius={90}
                                dataKey="value"
                                label={({ name, value }) => `${name}:\n${(value / analysis.commentCount * 100).toFixed(0)}%`}
                            >
                                {sentimentData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>

                    {/* Right: Top Themes, subreddit Links */}
                    <div>
                        <p className="font-semibold mb-2">Top Themes</p>
                        <ul className="space-y-4 mb-6">
                            {analysis.topThemes.map((themeObj: { theme: string, quote: string }, index: number) => (
                                <li key={index}>
                                    <p className="font-medium">{themeObj.theme}:</p>
                                    <p className="italic text-gray-600">&quot;{themeObj.quote}&quot;</p>
                                </li>
                            ))}
                        </ul>
                        <p className="font-semibold mb-2">Subreddit Sources:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            {subreddits.map((sub: string, index: number) => (
                                <li key={index}>
                                    <Link className="underline text-orange-500 hover:text-orange-400" href={`https://www.reddit.com/r/${sub}`}>
                                        r/{sub}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Delete Button */}
                <div className="w-130 flex justify-center mt-6">
                    <button
                        id="delete-analysis"
                        onClick={() => handleDeleteAnalysis()}
                        className="px-5 py-2 rounded-lg text-white font-bold bg-red-500 hover:bg-red-400"
                    >
                        Delete Analysis
                    </button>
                </div>
            </div>

            {/* Expand Comments */}
            <section >
                {comments.length > 0 && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowComments((prev) => !prev)}
                            className="px-5 py-2 mt-4 rounded-lg text-white font-bold bg-gray-600 hover:bg-gray-500"
                        >
                            {showComments ? "Show Reddit Comments" : "Hide Reddit Comments"}
                        </button>
                    </div>
                )}
                {!showComments && <CommentsList comments={comments} />}
            </section>

        </div>
    );
};

export default SavedCard;