/* Helper Function to Clean User Query */

// Sanitizes the query --- subreddits only contain letters, numbers and underscores (no apostrophes, punctuation, etc.)
// for Reddit's API, + symbol is valid search query format (e.g., query of "McDonalds value menu" --> mcdonalds+value+menu)

export function cleanQueryHelper(query: string): string {
    return query.trim().replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "+");
} 