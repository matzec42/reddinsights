/* Helper Function to Parse the Listing of Subreddits */

export function subredditParser(subredditList: string): string[] {

    try {
        const extracted = subredditList.match(/"([^"\n]+)"/g);
        const rawSubreddits = extracted ? extracted.map(s => s.replace(/"/g, '').replace(/\s+/g, '')) : [];
        
        // edge case handling --- prevents runaway generation (an LLM failure --- the llama model that fetches subreddits has done this)
        const fetchedSubreddits = [...new Set(rawSubreddits)].slice(0, 5);
        console.log("Parsed subreddit list:", fetchedSubreddits);

        return fetchedSubreddits;

    } catch (error) {
        console.error("Failed to parse subreddit response:", subredditList, { error });
        throw new Error(`Failed to parse subreddit response: ${subredditList}`);
    }

}