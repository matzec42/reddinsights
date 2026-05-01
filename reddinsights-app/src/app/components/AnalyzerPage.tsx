"use client"

import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useState } from 'react';

const AnalyzerPage: React.FunctionComponent = () => {
    // state for search results
    const [searchResults, setSearchResults] = useState(null);
    const [analysisType, setAnalysisType] = useState("general");
    const [isLoading, setIsLoading] = useState(false);


    // handleSearchSubmit function for user's search term (POST)
    const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formInput = e.currentTarget;
        const formInputData = new FormData(formInput);
        const searchTerm = formInputData.get("query") as string;
        const type = analysisType;

        setIsLoading(true);

        try {
            // error handling --- missing search term, response not OK
            if (!searchTerm.trim()) {
                console.error("Invalid search term")
                alert("Please submit a term to search.");
                return;
            }
            // fetch for RedditAPI
            const response = await fetch('/api/apiReddit', {
                method: "POST",
                // credentials: include,                        // uncomment when sessions, cookies are set up
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchTerm, type: type })
            })

            // error handling for bad response
            if (!response.ok) throw new Error("Something went wrong---unable to retrieve Insights.");

            // parse response from /api/apiReddit/route.ts
            const fetchedAnalysis = await response.json();

            if (!fetchedAnalysis.data) {
                console.error(`${fetchedAnalysis.message}`)
                return alert(`${fetchedAnalysis.message}. Please try another Analysis with an existing Subreddit.`)
            }

            console.log("Fetched analysis:", fetchedAnalysis.data);
            setSearchResults(fetchedAnalysis.data);

        } catch (err) {
            console.error("Error fetching analysis", err);
            alert("Something went wrong while trying to fetch insights. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // TO-DO: fix bug to pass props to Card.tsx (TS error). Related to how JSON object gets returned from backend (as a string/markdown coded block)
    // Prompt modifying on backend does not fix it, may need to implement a parsing function in API

    return (
        <div>
            <Navbar />
            <div>
                <h1 className="font-bold m-2 text-2xl mt-4">Instructions:</h1>
                <ul className="m-2 p-1 list-disc list-inside">
                    <li>
                        Enter a Subreddit name (if you know it) or a search you want to get insights for (e.g., McDonalds for http://www.reddit.com/r/McDonalds, <br/>
                        or a simple search like &quot;McDonalds value menu&quot;).
                    </li>
                    <li>
                        Click &quot;General Analysis&quot; or, for more tailored insights, select a specific analysis type (&quot;Brand Insights&quot; or &quot;Student Trends&quot;).
                    </li>
                    <li>
                        Reddinsights will perform an AI-powered analysis of top Subreddit posts and replies. <br/>
                    </li>
                    <li>
                        You can save the newly-created Reddinsight to your collection, or click on the &quot;Start a New Analysis&quot; in the navigation to start fresh with a new search.
                    </li>
                </ul>
            </div>

            <form onSubmit={handleSearchSubmit} method="post">
                <input className="w-100 border border-gray-300 m-2 p-2 rounded-md" name="query" placeholder="Type a subreddit name or topic (e.g., Target, Amazon)" />

                <button id="general-analysis" onClick={() => setAnalysisType("general")}disabled={isLoading}  type="submit" className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
                    {isLoading ? "Analyzing..." : "General Analysis"}
                </button>
                <button id="brand-insights" onClick={() => setAnalysisType("brand")} disabled={isLoading} type="submit" className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
                    {isLoading ? "Analyzing..." : "Brand Insights"}
                </button>
                <button id="education-trends" onClick={() => setAnalysisType("student")} disabled={isLoading} type="submit" className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
                    {isLoading ? "Analyzing..." : "Student Trends"}
                </button> 
            </form>

            {searchResults ? <Card analysis={searchResults} />
                : <p className="m-2 p-4 bg-gray-100 rounded-md">Your analysis will appear here once you submit a search.</p>
            }
        </div>
    )
}

export default AnalyzerPage