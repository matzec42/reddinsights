"use client"

import { useState, useEffect } from 'react';

const MESSAGES = [
    "Reddinsights is getting to work...",
    "Discovering relevant subreddits...",
    "Fetching Reddit discussions...",
    "Parsing and formatting comments...",
    "Analyzing sentiment...",
    "Still working...",
    "Almost done...",
    "Finishing analysis...",
    "Thanks for your patience...",
    "Nearly there..."
];

const Loading: React.FunctionComponent = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            <p className="text-gray-700 font-medium font-semibold">{MESSAGES[messageIndex]}</p>
        </div>
    );
};

export default Loading;