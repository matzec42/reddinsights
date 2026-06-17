"use client"

import { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { AnalysisType } from '@/types/card-component-types.ts/card-component-type';

const DashboardPage: React.FunctionComponent = () => {
    // state for dashboard data (past analyses associated w/ user)
    const [userAnalyses, setUserAnalyses] = useState([]);

    // useEffect to fetch past analysis on component mount
    useEffect(() => {
        const fetchPastAnalyses = async () => {
            try {
                const response = await fetch("/api/get-analyses");
                const data = await response.json();

                if (!response.ok) {
                    console.error("Failed to fetch past analyses:", data.message);
                    return;
                }

                setUserAnalyses(data.data);
                // console.log("Fetched analyses:", data.data);

            } catch (err) {
                console.error("Error fetching past analyses:", err);
                alert("Something went wrong while trying to load your analyses. Try refreshing the page or waiting a moment before trying again.");
            }
        }
        fetchPastAnalyses();
    }, []);

    // JSX:
    // Each row is a snapshort of a card. clicking on a card take user to detailed view of that analysis that displays data and is styled like Card component.
    // Flex rows, paginated on scroll.
    return (
        <div>
            {
                userAnalyses.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No saved any analyses yet. Head to the Analyzer page to generate insights from Reddit discussions and save your favorite analyses here for easy access later!</p>
                ) : (
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <h1 className="text-3xl font-bold mb-6">Your Saved Analyses</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {userAnalyses.map((analysis: AnalysisType) => (
                                <DashboardCard key={analysis._id} analysis={analysis} />
                            ))}

                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default DashboardPage