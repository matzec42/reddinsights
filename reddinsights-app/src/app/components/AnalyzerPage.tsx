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

    // return (
    //     <div className="max-w-6xl mx-auto px-4 py-6">
    //         <Navbar />
    //         <div>
    //             <h1 className="font-bold m-2 text-2xl mt-4">Instructions:</h1>
    //             <ul className="m-2 p-1 list-disc list-inside">
    //                 <li>
    //                     Enter a Subreddit name (if you know it) or a search topic you want to get insights for (e.g., McDonalds for http://www.reddit.com/r/McDonalds, <br/>
    //                     or a simple search like &quot;McDonalds value menu&quot;).
    //                 </li>
    //                 <li>
    //                     Click &quot;General Analysis&quot; or, for more tailored insights, select a specific analysis type (&quot;Brand Insights&quot; or &quot;Student Trends&quot;).
    //                 </li>
    //                 <li>
    //                     Reddinsights will perform an AI-powered analysis of top Reddit discussions and comments. <br/>
    //                 </li>
    //                 <li>
    //                     Save the analysis to your collection, or click on the &quot;Start a New Analysis&quot; in the navigation to start fresh with a new one.
    //                 </li>
    //             </ul>
    //         </div>

    //         <form onSubmit={handleSearchSubmit} method="post">
    //             <input className="w-100 border border-gray-300 m-2 p-2 rounded-md" name="query" maxLength={30} required placeholder="Type a subreddit name or topic (e.g., Target, Amazon)" />

    //             <button id="general-analysis" onClick={() => setAnalysisType("general")}disabled={isLoading}  type="submit" className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
    //                 {isLoading ? "Analyzing..." : "General Analysis"}
    //             </button>
    //             <button id="brand-insights" onClick={() => setAnalysisType("brand")} disabled={isLoading} type="submit" className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
    //                 {isLoading ? "Analyzing..." : "Brand Insights"}
    //             </button>
    //             <button id="education-trends" onClick={() => setAnalysisType("student")} disabled={isLoading} type="submit" className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250">
    //                 {isLoading ? "Analyzing..." : "Student Trends"}
    //             </button> 
    //         </form>

    //         {searchResults ? <Card analysis={searchResults} />
    //             : <p className="m-2 p-4 bg-gray-100 rounded-md">Your analysis will appear here once you submit a search.</p>
    //         }
    //     </div>
    // )

    return (
        <div>
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Instructions */}
                <section className="mb-8">

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="font-semibold text-xl mb-3">
                            Instructions
                        </h2>

                        <ul className="space-y-3 list-disc list-inside text-gray-700">
                            <li>
                                Enter a Subreddit name (if you know it) or a search topic you want to get insights for (e.g., <i>McDonalds</i> for http://www.reddit.com/r/McDonalds, or a simple search like <i>McDonalds value menu</i>).
                            </li>

                            <li>
                                Click &quot;General Analysis&quot; or select a specific analysis type for more tailored results (&quot;Brand Insights&quot; or &quot;Student Trends&quot;).
                            </li>

                            <li>
                                AI analyzes top Reddit discussions and comments.
                            </li>

                            <li>
                                Save the analysis or start a new one anytime.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Search Form */}
                <section className="mb-8">
                    <form
                        onSubmit={handleSearchSubmit}
                        method="post"
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex flex-col gap-4">

                            <input
                                className="w-full border border-gray-300 p-3 rounded-lg"
                                name="query"
                                maxLength={40}
                                required
                                placeholder="Type a subreddit name or topic (e.g., Target, Amazon)"
                            />

                            <div className="flex flex-wrap gap-3">
                                <button
                                    id="general-analysis"
                                    onClick={() => setAnalysisType("general")}
                                    disabled={isLoading}
                                    type="submit"
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-orange-600 hover:bg-orange-500"
                                >
                                    {isLoading
                                        ? "Analyzing..."
                                        : "General Analysis"}
                                </button>

                                <button
                                    id="brand-insights"
                                    onClick={() => setAnalysisType("brand")}
                                    disabled={isLoading}
                                    type="submit"
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-orange-600 hover:bg-orange-500"
                                >
                                    {isLoading
                                        ? "Analyzing..."
                                        : "Brand Insights"}
                                </button>

                                <button
                                    id="education-trends"
                                    onClick={() => setAnalysisType("student")}
                                    disabled={isLoading}
                                    type="submit"
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-orange-600 hover:bg-orange-500"
                                >
                                    {isLoading
                                        ? "Analyzing..."
                                        : "Student Trends"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Results */}
                <section>
                    {searchResults ? (
                        <Card analysis={searchResults} />
                    ) : (
                        <div className="bg-gray-100 rounded-2xl p-6 text-gray-600">
                            Your analysis will appear here once you submit a search.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AnalyzerPage