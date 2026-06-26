/* Reddit Comment Helper Function */

// heuristics for comment length, maxComments (# of comments to include in context window for prompt, set at 30 for all modes for now; comment length to avoid too brief/unhelpful & too long)
// formats comments prior to the 2nd LLM API call (e.g., trimming, numbering, line breaks) to improve consistency, reliability of model's analysis and human readability

export function redditCommentFormatter(comments: string[], maxComments: number): string {
    const result = comments
    .filter(r => typeof r === "string" && r.trim().length > 20 && r.trim().length < 2000)
    .slice(0, maxComments)
    .map((r, i) => `Comment ${i + 1}: ${r.trim().slice(0, 1500)}`)
    .join("\n\n---\n\n");

    console.log(`Formatted Reddit comments/replies string: ${result}`);

    return result
}