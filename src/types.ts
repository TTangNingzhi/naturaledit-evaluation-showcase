export type SummaryObject = {
    title: string;
    low_unstructured: string;
    low_structured: string;
    medium_unstructured: string;
    medium_structured: string;
    high_unstructured: string;
    high_structured: string;
};

export type SummaryResultObject = {
    low_unstructured: string;
    low_structured: string;
    medium_unstructured: string;
    medium_structured: string;
    high_unstructured: string;
    high_structured: string;
};

export type SummaryOutputObject = SummaryResultObject;
export type SummaryErrorObject = SummaryResultObject;

export type Sample = {
    buggy_code: string;
    instruction: string;
    ground_truth: string;
    output_direct: string;
    output_summary: SummaryOutputObject;
    original_summary: SummaryObject;
    edited_summary: SummaryObject;
    result_direct: string;
    error_direct: string;
    result_summary: SummaryResultObject;
    error_summary: SummaryErrorObject;
};

/* ===== Expert Ratings Types ===== */

export type Granularity = "low" | "medium" | "high";
export type StructType = "structured" | "unstructured";

/**
 * Union of the 6 summary text/mapping keys.
 */
export type SummaryFieldKey =
    | "low_unstructured"
    | "low_structured"
    | "medium_unstructured"
    | "medium_structured"
    | "high_unstructured"
    | "high_structured";

/**
 * Code snippet within a mapping, originating from tasks-output.json.
 * Line is 1-based if present in the input JSON.
 */
export type CodeSegment = { code: string; line: number };

/**
 * Mapping between a summary phrase and one or more code segments.
 */
export interface SummaryCodeMapping {
    summaryComponent: string;
    codeSegments: CodeSegment[];
}

/**
 * Container for all 6 mapping buckets.
 */
export type MappingsByKey = {
    low_unstructured: SummaryCodeMapping[];
    low_structured: SummaryCodeMapping[];
    medium_unstructured: SummaryCodeMapping[];
    medium_structured: SummaryCodeMapping[];
    high_unstructured: SummaryCodeMapping[];
    high_structured: SummaryCodeMapping[];
};

/**
 * Raw input task item from public/data/tasks-input.json
 */
export type TaskInput = {
    id: string;
    file_path: string;
    old_code: string;
    old_context: string;
    old_start_line: string; // keep as string to mirror source; parse to number when merging
    new_code: string;
    new_context: string;
    new_start_line: string; // keep as string to mirror source; parse to number when merging
};

/**
 * Raw output task item from public/data/tasks-output.json
 */
export type TaskOutput = {
    task_id: string;
    metadata?: {
        file_context?: string;
        processing_timestamp?: number;
    };
    old_code: {
        code: string;
        summary: SummaryObject;
        mappings: MappingsByKey;
    };
    new_code: {
        code: string;
        summary: SummaryObject;
        mappings: MappingsByKey;
    };
};

/**
 * Merged task model for Expert Ratings.
 */
export type MergedTask = {
    id: string;
    path: string;
    meta?: TaskOutput["metadata"];
    old: {
        code: string;
        context: string;
        startLine: number;
        summary: SummaryObject;
        mappings: MappingsByKey;
    };
    new: {
        code: string;
        context: string;
        startLine: number;
        summary: SummaryObject;
        mappings: MappingsByKey;
    };
};
