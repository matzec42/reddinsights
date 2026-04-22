"use client"

import Navbar from '../components/Navbar';

const AnalyzerPage: React.FunctionComponent = () => {
    // handleSearchSubmit function for user's search term (POST)
    const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formInput = e.currentTarget;
        const formInputData = new FormData(formInput);
        const searchTerm = formInputData.get("query") as string;

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
                // credentials: include,   // uncomment when sessions, cookies are set up
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchTerm })
            })

            // error handling for bad response
            if (!response.ok) throw new Error("Something went wrong---unable to retrieve Insights.");

            // parse response from /api/apiReddit/route.ts
            const fetchedAnalysis = await response.json();

            if (!fetchedAnalysis.data) {
                console.error(`${fetchedAnalysis.message}`)
                return alert(`${fetchedAnalysis.message}. Please try another Analysis with an existing Subreddit.`)
            }

            return console.log(`AnalyzerPage component, after POST, parsed data: ${fetchedAnalysis.data}`);

            // dynamically build Insight analysis card with response data

        } catch (err) {
            console.error("Error fetching analysis", err);
            alert("Something went wrong while trying to fetch insights. Please try again.");
        }
    }

    return (
        <div>
            <Navbar />
            <div>
                <h1 className="font-bold m-2 text-2xl mt-4">Instructions:</h1>
                <ul className="m-2 p-1 list-disc list-inside">
                    <li>
                        Enter a Subreddit name (if you know it) or a search you want to get insights for (e.g., McDonalds for http://www.reddit.com/r/McDonalds, <br/>
                        or a simple search like &quot;McDonalds menu&quot;).
                    </li>
                    <li>
                        Click the Analyze button.
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
                <input className="w-100 border border-gray-300 m-2 p-2 rounded-md" name="query" placeholder="Type a Subreddit name (e.g., Target, Amazon)" />
                <button className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250" type="submit">Analyze</button>
            </form>
        </div>
    )
}

export default AnalyzerPage