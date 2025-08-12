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
