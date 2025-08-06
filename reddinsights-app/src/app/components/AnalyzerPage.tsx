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
            const response = await fetch('/api/apiReddit', {
                method: "POST",
                // credentials: include,   // uncomment when sessions, cookies are set up
                headers: { "Content-Type" : "application/json" },
                body: JSON.stringify({ query: searchTerm })
            })
    
            // error handling --- missing search term, response not OK
            if (!searchTerm) {
                alert("Please submit a term to search.");
                return;
            }
            if (!response.ok) throw new Error ("Something went wrong---unable to retrieve Insights.");

            // parse the response
            // const data = await response.json();
            
            // in the return, dynamically build Insight analysis card with response data

        } catch {

        }
    }
    

    return (
        <div>
            <Navbar />
            <form onSubmit={handleSearchSubmit} method="post">
                <input className="w-100 border border-gray-300 m-2 p-2 rounded-md" name="query" placeholder="Type a Subreddit topic here (e.g., Target, Amazon)" />
                <button className="w-40 py-2 rounded-md text-white font-bold bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-250" type="submit">Analyze</button>
            </form>
        </div>
    )
}

export default AnalyzerPage