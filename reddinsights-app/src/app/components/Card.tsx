// individual Card component --- to be used in /analyzer (child of AnalyzerPage) when user makes new analysis
// also on the SubredditsCardPage (all insights based on a topic)...?

import React from 'react';
import { CardProps } from '../../types/card-component-types.ts/card-component-type';

const Card: React.FunctionComponent<CardProps> = ({ analysis, className }) => {
    return (
        <div className={className}>
            <h2 className="font-bold text-xl mb-2">Card Title: {analysis.analysisTitle}</h2>
            <p>{`Summary: ${analysis.generalSummary}`}</p>
            <p className="text-gray-700">This is a card component. It can be used to display insights, analysis, or other content related to the AI-analyzed Reddit data.</p>
        </div>
    );
};

export default Card;