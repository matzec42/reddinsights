/* Text Normalizer Helper Function */
// To be used per
// see Reddit API helper function (comment fetching, normalizing, ranking); perhaps Reddit formatting helper (?)

// Reason:
// MongoDB was still successfully storing created analyses, fetching for the DashboardPage, etc., but there was a data hygiene issue
// Documents in the whole cluster weren't visible/rendered in Atlas or Compass due to a UTF-8 error ("Invalid UTF-8 string in BSON document")
// Discovered a couple of analyses with bad/corrupted data (likely Reddit comments) as root cause

export function normalizeText(input: string): string {
    if (!input) return "";

    return input
        .replace(/\u0000/g, "")                                         // null bytes
        .replace(/[\uFFFE\uFFFF]/g, "")                                 // invalid unicode markers
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")       // control chars
        .normalize("NFKC");                                             // unicode normalization
}