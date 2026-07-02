// Individual Card component --- to be used in /analyzer (child of AnalyzerPage) when user makes new analysis

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CardProps } from '../../types/card-component-types.ts/card-component-type';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#41cb5b', '#fd4c0b', '#979a9c',];

const Card: React.FunctionComponent<CardProps> = ({ analysis, subreddits, comments }) => {

    // state for saving functionality --- useState hook not needed, as data is static and passed down as props
    // re-assigning to variables for handleSave function to access
    const analysisData = analysis;
    const subredditsData = subreddits;
    const redditComments = comments;
    // assigning sentiment data for visualization --- fix this longer term (see SavedCard, DashboardCard components) --- ideally, sentimentSummary would be stored as numbers in DB, not strings
    const sentimentData = [
        { name: 'Positive', value: analysis.sentimentSummary.positive },
        { name: 'Negative', value: analysis.sentimentSummary.negative },
        { name: 'Neutral', value: analysis.sentimentSummary.neutral },
    ];

    // TO-DO: edit data attribute on Pie component --- pull values from sentimentSummary property and convert here, before return
    // LONGER TERM: edit models/DB to store numbers instead of strings, check that storage and usage is consistent in other components (DashboardCard, Card, SavedCard)

    // variable for idempotency key for saving functionality (avoid duplicate saves)
    const idempotencyKeyRef = React.useRef(crypto.randomUUID());

    const handleSaveAnalysis = async () => {
        const payload = { analysis: analysisData, subreddits: subredditsData, visualization: sentimentData, comments: redditComments };

        try {
            const response = await fetch('/api/save-analysis', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": idempotencyKeyRef.current,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                alert("Failed to save analysis. Please try again.");
                return;
            }
            // console.log(`Analysis saved: ${response.json()}`);
            alert("Analysis saved successfully!");

            // triggers state reset (form, display of card) in AnalyzerPage
            // onSave();

        } catch (err) {
            console.error("Error saving analysis", err);
            alert("Something went wrong while trying to save your analysis. Please try again.");
        }
    }


    return (
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">

            {/* Header */}
            <div className="mb-6">
                <Link href="/dashboard">
                    <Image
                        width={20}
                        height={20}
                        alt={"Back button"}
                        src={"/arrow_back.svg"}
                        className="mb-3"
                    />
                </Link>
                <h2 className="font-bold text-2xl">{analysis.analysisTitle}</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(analysis.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Posts & Comments Analyzed: {analysis.commentCount}</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">

                {/* Left: Summary, Sentiment Chart */}
                <div>
                    <p className="font-semibold mb-1">Summary</p>
                    <p className="text-gray-700 mb-6">{analysis.generalSummary}</p>
                    <p className="font-semibold mb-2">Overall Sentiment: {analysis.sentimentSummary.overall.charAt(0).toUpperCase() + analysis.sentimentSummary.overall.slice(1)}</p>
                    <PieChart width={500} height={300} className="mx-auto">
                        <Pie
                            data={sentimentData}
                            cx={250}
                            cy={130}
                            outerRadius={90}
                            dataKey="value"
                            label={({ value }) => `${(value / analysis.commentCount * 100).toFixed(0)}%`}
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

            {/* Save Button */}
            <div className="w-130 flex justify-center mt-6">
                <button 
                    id="save-analysis"
                    onClick={() => handleSaveAnalysis()}
                    className="px-5 py-2 rounded-lg text-white font-bold bg-green-500 hover:bg-green-400"
                >
                    Save Analysis
                </button>
            </div>

        </div>
    );
};

export default Card;