// individual Card component --- to be used in /analyzer (child of AnalyzerPage) when user makes new analysis
// also on the SubredditsCardPage (all insights based on a topic)...?

import React from 'react';
import Link from 'next/link';
import { CardProps } from '../../types/card-component-types.ts/card-component-type';

const Card: React.FunctionComponent<CardProps> = ({ analysis, subreddits }) => {
    return (
        <div className="m-2 p-4 bg-gray-100 border border-gray-200 rounded-md shadow-lg">
            {/* <div className="flex justify-between items-start mb-2"> */}
                <h2 className="font-bold text-xl mb-2">
                    {analysis.analysisTitle}
                </h2>

                <p className="text-sm text-gray-500">
                    {new Date(analysis.createdAt).toLocaleString()}
                </p>

                <p className="font-semibold mt-4">Comment Count: {analysis.commentCount}</p>

                <p className="font-semibold mt-4">Summary:</p>
                <p>
                    {analysis.generalSummary}
                </p>

                <p className="font-semibold mt-4">Overall Sentiment: {analysis.sentimentSummary.overall.toUpperCase()}</p>
                <ul>
                    <li>Positive: {analysis.sentimentSummary.positive}</li>
                    <li>Negative: {analysis.sentimentSummary.negative}</li>
                    <li>Neutral: {analysis.sentimentSummary.neutral}</li>
                </ul>

                <h3 className="font-semibold mt-4">Top Themes:</h3>
                <ul>
                    {analysis.topThemes.map((themeObj: { theme: string, quote: string }, index: number) => (
                        <li key={index}>
                            <p className="font-medium">Theme: {themeObj.theme}</p>
                            <p className="italic">Quote: &quot;{themeObj.quote}&quot;</p>
                        </li>
                    ))}
                </ul>

                <h3 className="font-semibold mt-4">Subreddit source links:</h3>
                <ul className="space-y-1 list-disc list-inside">
                    {subreddits.map((sub: string, index: number) => {
                        return (
                                <li key={`${index}`}>
                                    <Link className="bold underline text-orange-500" href={`https://www.reddit.com/r/${sub}`}>
                                        {`${sub}`}
                                    </Link>
                                </li>
                        )
                    })}
                </ul>
            {/* </div> */}
        </div>
    );
};

export default Card;