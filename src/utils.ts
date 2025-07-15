// Utility functions for parsing JSONL and generating summary diffs
import type { Sample } from "./types";

// Parse a JSONL string into an array of Sample objects
export function parseJSONL(text: string): Sample[] {
    return text
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(Boolean) as Sample[];
}
