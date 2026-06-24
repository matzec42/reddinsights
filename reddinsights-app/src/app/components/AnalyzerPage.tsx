"use client"

import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Loading from '../components/Loading';
import CommentsList from './CommentsList';
import { useState, useEffect, useRef } from 'react';

const AnalyzerPage: React.FunctionComponent = () => {
    // state for search results
    const [searchResults, setSearchResults] = useState(null);
    const [subreddits, setSubreddits] = useState<string[]>([]);
    const [redditComments, setRedditComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [analysisType, setAnalysisType] = useState("general");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // hook to call form reset, invoked after user submits search
    const formRef = useRef<HTMLFormElement>(null);

    // handleSearchSubmit function for user's search term (POST)
    const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formInput = e.currentTarget;
        const formInputData = new FormData(formInput);
        const searchTerm = formInputData.get("query") as string;
        const type = analysisType;

        setIsLoading(true);

        try {
            if (!searchTerm.trim()) {
                setErrorMessage("Please submit a valid search term.");
                return;
            }

            const response = await fetch('/api/generate-analysis', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchTerm, type: type })
            });

            const fetchedAnalysis = await response.json();

            if (!response.ok || !fetchedAnalysis.data) {
                setErrorMessage(fetchedAnalysis.message || "Something went wrong. Please try again.");
                setSearchResults(null);
                return;
            }

            // update state
            setSearchResults(fetchedAnalysis.data[0]);
            setSubreddits(fetchedAnalysis.data[1]);
            setRedditComments(fetchedAnalysis.data[2]);

            // resets search bar
            formRef.current?.reset();

        } catch (err) {
            console.error("Error fetching analysis", err);
            alert("Something went wrong while trying to fetch insights. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    // Handler for resetting page/clearing card after a save --- needs to be passed down as prop to Card,
    // since save functionality lives there but state (user's search result) lives here.
    // Commented out for now...not sure about usefulness of this
    // Card.tsx, card-component-type.ts also have related functionality for this commented out (for now)
    // const resetAnalysis = () => {
    //     setSearchResults(null);
    //     setSubreddits([]);
    // };


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
                                Enter a <b>subreddit name</b> (if you know it) or a <b>search terms</b> for a topic you want to get insights for (e.g., <i>McDonalds</i> for http://www.reddit.com/r/McDonalds, or a simple search like <i>McDonalds value menu</i>).
                            </li>

                            <li>
                                Click <b>&quot;General Analysis&quot;</b> or select a <b>specific analysis mode</b> for more tailored results (&quot;Brand Insights&quot; or &quot;Student Trends&quot;).
                            </li>

                            <li>
                                AI analyzes top Reddit discussions and comments.
                            </li>

                            <li>
                                <b>Save</b> the analysis or start a new one anytime.
                            </li>
                            <li>
                                Click <b>&quot;Show Reddit Comments&quot;</b> to look at the raw comments that were retrieved and analyzed. These can give context to the analysis that was created and/or help refine your next search.
                            </li>
                            <li>
                                When looking at Reddit Comments, the <b>score</b> figure corresponds to how popular it was based on Reddit user upvotes.
                            </li>
                            <li>
                                The <b>relevance</b> figure is a figure which indicates how related the Reddit comment is to the keywords from the search terms.
                            </li>
                            <li>
                                <b>NOTE:</b> if a search doesn&apos;t return an analysis, experiment with <b>different terms</b> or one of the <b>other search modes</b>.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Search Form */}
                <section className="mb-8">
                    <form
                        ref={formRef}
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

                            <div className="flex justify-between gap-3">
                                <button
                                    id="general-analysis"
                                    onClick={() => setAnalysisType("general")}
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-amber-600 hover:bg-amber-500"
                                >
                                    General Analysis
                                </button>

                                <button
                                    id="brand-insights"
                                    onClick={() => setAnalysisType("brand")}
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-cyan-600 hover:bg-cyan-500"
                                >
                                    Brand Insights
                                </button>

                                <button
                                    id="trending-topics"
                                    onClick={() => setAnalysisType("trending")}
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-rose-600 hover:bg-rose-500"
                                >
                                    Trending Topics
                                </button>

                                <button
                                    id="education-trends"
                                    onClick={() => setAnalysisType("student")}
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-5 py-2 rounded-lg text-white font-bold bg-emerald-600 hover:bg-emerald-500"
                                >
                                    Student Trends
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Results */}
                <section>
                    {isLoading ? (
                        <Loading />
                    ) : searchResults ? (
                        <Card analysis={searchResults} subreddits={subreddits} comments={redditComments}/>
                    ) : errorMessage ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
                            {errorMessage}
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-2xl p-6 text-gray-600">
                            Your analysis will appear here once you submit a search.
                        </div>
                    )}
                </section>

                {/* Expand Comments */}
                <section>
                    {redditComments.length > 0 && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => setShowComments((prev) => !prev)}
                                className="px-5 py-2 rounded-lg text-white font-bold bg-gray-600 hover:bg-gray-500"
                            >
                                {showComments ? "Hide Reddit Comments" : "Show Reddit Comments"}
                            </button>
                        </div>
                    )}

                    {showComments && <CommentsList comments={redditComments} />}
                </section>
            </div>
        </div>
    );
}

export default AnalyzerPage