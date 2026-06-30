/* Deep Sanitizer Helper Function */

// Deeply sanitizes any value returned from LLM or external sources
// Recursively walks objects/arrays
// Normalizes all strings using normalizeText(), but leaves numbers, booleans, null, dates untouched

// Reason:
// Extra validation layer before saving LLM-produced analyses (see api/save-analysis/route.ts)
// Possible source of UTF-8 error in MongoDB Atlas

import { normalizeText } from "./text-normalizer";

type Primitive = string | number | boolean | null | undefined | symbol | bigint;

type SanitizeInput =
    | Primitive
    | Date
    | SanitizeInput[]
    | { [key: string]: SanitizeInput };

export function deepSanitize<T extends SanitizeInput>(
    input: T,
    seen = new WeakSet<object>()
): T {
    if (input === null || input === undefined) return input;

    if (typeof input === "string") {
        return normalizeText(input) as T;
    }

    if (typeof input !== "object") {
        return input;
    }

    if (input instanceof Date) {
        return input;
    }

    // circular reference guard
    if (seen.has(input)) {
        return input;
    }
    seen.add(input);

    // arrays
    if (Array.isArray(input)) {
        return input.map((item) =>
            deepSanitize(item, seen)
        ) as T;
    }

    // objects
    const output: Record<string, SanitizeInput> = {};

    for (const [key, value] of Object.entries(input)) {
        output[key] = deepSanitize(value, seen);
    }

    return output as T;
}