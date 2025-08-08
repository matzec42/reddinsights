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
            const fetchedThreads = await response.json();

            if (!fetchedThreads.data) {
                console.error(`${fetchedThreads.message}`)
                return alert(`${fetchedThreads.message}. Please try another Analysis with an existing Subreddit. Related Subreddits: ${fetchedThreads.suggestions}`)
            }

            return console.log(`AnalyzerPage component, after POST, parsed data: ${fetchedThreads.data}`);

            // dynamically build Insight analysis card with response data

        } catch {
            return new Response(JSON.stringify({
                success: false,
                message: "Something went wrong."
            }), { status: 500 })
        }
    }

    return (
        <div>
            <Navbar />
            <div>
                <h1 className="font-bold m-2 text-2xl mt-4">Instructions:</h1>
                <ul className="m-2 p-1 list-square list-inside">
                    <li>
                        Enter the name of the Subreddit you want to get insights for. <br/>
                        (in a Reddit URL, it is the text that comes after the /r/ --- e.g., McDonalds for http://www.reddit.com/r/McDonalds)
                    </li>
                    <li>
                        Click the &quot;Analyze&quot; button.
                    </li>
                    <li>
                        Reddinsights will perform an AI-powered analysis of the Subreddit&apos;s hottest threads. <br/>
                        (&quot;Hot&quot; threads are posts which are gaining in popularity with upvotes and comments.)
                    </li>
                    <li>
                        You can save the newly-created Reddinsight to your collection, or click on the &quot;Start a New Analysis&quot; in the navigation to start fresh.
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