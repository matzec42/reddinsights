"use client"

import { useEffect, useState, useRef, useCallback } from 'react';
import DashboardCard from './DashboardCard';
import { AnalysisType } from '@/types/card-component-types/card-component-type';

// variable for pagination
const CARDS_PER_PAGE = 9;

const DashboardPage: React.FunctionComponent = () => {
    // state for dashboard data (past analyses associated w/ user)
    // full list of user saved user analyses
    const [userAnalyses, setUserAnalyses] = useState([]);
    // subset of analyses that is shown on screen, grows as user scrolls
    const [displayedCards, setDisplayedCards] = useState<AnalysisType[]>([]);
    // flag that tracks if there are more cards to load
    const [hasMore, setHasMore] = useState(true);
    // tracks which "batch" the user is on (e.g., page 1 = first 9, page 2 = first 18, etc. if CARDS_PER_PAGE = 9)
    const [page, setPage] = useState(1);

    // a reference to an invisible div at bottom of list, the observer watches this (see 2nd useEffect below, just before return statement)
    const sentinelRef = useRef<HTMLDivElement>(null);

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

                // update state --- fetched all saved analyses
                setUserAnalyses(data.data);
                // update state --- shows first batch of cards
                setDisplayedCards(data.data.slice(0, CARDS_PER_PAGE));
                // update state --- evaluates to Boolean (flag for if the full list is greater than cards per page, i.e. there are more to load)
                setHasMore(data.data.length > CARDS_PER_PAGE);

            } catch (err) {
                console.error("Error fetching past analyses:", err);
                alert("Something went wrong while trying to load your analyses. Try refreshing the page or waiting a moment before trying again.");
            }
        }

        fetchPastAnalyses();
        
    }, []);
    
    
    // Each time loadMore runs, it advances one page and slices a bigger chunk of array from userAnalyses (the full list)
    // useCallback caches the callback function so it isn't re-creating loadMore with every re-render (and so that the useEffect below isn't infinitely re-rendering, since it's in its dependency array)
    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        const nextCards = userAnalyses.slice(0, nextPage * CARDS_PER_PAGE);
        setDisplayedCards(nextCards);
        setPage(nextPage);
        setHasMore(nextCards.length < userAnalyses.length);
    }, [page, userAnalyses]);


    // useEffect --- purpose is to set up and tear down the observer 
    // observer is assigned a new instance of an observer (IntersectionObserver is a browser API, job is to watch whether an element is visible in the viewport)
        // invokes loadMore when sentintel comes into viewport
        // threshold arg -- "only trigger when the sentinel is 100% visible"
    useEffect(() => {
        if (!hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { threshold: 1.0 }
        );
        // start watching the sentinel div --- it adds the sentinel div to the IntersectionObserver's set of target elemenst to watch
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        // cleanup --- kills the previous observer before the effect re-runs; it keeps observers from stacking up and firing loadMore multiple times
        return () => observer.disconnect();
        // dependency array for flag (hasMore) and the loadMore (callback function that updates page number, next cards to be displayed)
    }, [hasMore, loadMore]);


    return (
        <div>
            {userAnalyses.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">
                    No saved analyses yet. Head to the Analyzer page to get started!
                </p>
            ) : (
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-6">Your Saved Analyses</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedCards.map((analysis: AnalysisType) => (
                            <DashboardCard key={analysis._id} analysis={analysis} />
                        ))}
                    </div>
                    {hasMore && <div ref={sentinelRef} className="h-10 mt-4" />}
                </div>
            )}
        </div>
    )
}

export default DashboardPage