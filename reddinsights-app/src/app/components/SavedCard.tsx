// individual Card component --- to be used in /analyzer (child of AnalyzerPage) when user makes new analysis
// also on the SubredditsCardPage (all insights based on a topic)...?
"use client"

import React from 'react';
import Link from 'next/link';
import { CardProps } from '../../types/card-component-types.ts/card-component-type';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#41cb5b', '#fd4c0b', '#979a9c',];

const SavedCard: React.FunctionComponent<CardProps> = ({ analysis, subreddits }) => {

    // assigning sentiment data for visualization
    const sentimentData = [
        { name: 'Positive', value: analysis.sentimentSummary.positive },
        { name: 'Negative', value: analysis.sentimentSummary.negative },
        { name: 'Neutral', value: analysis.sentimentSummary.neutral },
    ];

    // TO-DO: edit data attribute on Pie component --- pull values from sentimentSummary property and convert here, before return
    // LONGER TERM: edit models/DB to store numbers instead of strings, check that storage and usage is consistent in other components (DashboardCard, Card, SavedCard)

    return (
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">

            {/* Header */}
            <div className="mb-6">
                <h2 className="font-bold text-2xl">{analysis.analysisTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(analysis.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Comments analyzed: {analysis.commentCount}</p>
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

        </div>
    );
};

export default SavedCard;