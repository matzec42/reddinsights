// individual Card component --- to be used in /analyzer (child of AnalyzerPage) when user makes new analysis
// also on the SubredditsCardPage (all insights based on a topic)...?

import React from 'react';
import { CardProps } from '../../types/card-component-types.ts/card-component-type';

const Card: React.FunctionComponent<CardProps> = ({ analysis }) => {
    return (
        <div className="m-2 p-4 bg-gray-100 rounded-md">
            {/* <div className="flex justify-between items-start mb-2"> */}
                <h2 className="font-bold text-xl mb-2">
                    {analysis.analysisTitle}
                </h2>

                <p className="text-sm text-gray-500">
                    {new Date(analysis.createdAt).toLocaleString()}
                </p>
                <p>Comment Count: {analysis.commentCount}</p>
                <p>Summary: {analysis.generalSummary}</p>

                <ul>Overall Sentiment: {analysis.sentimentSummary.overall}
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
            {/* </div> */}
        </div>
    );
};

export default Card;