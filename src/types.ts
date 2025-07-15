// Type definition for a single sample in the dataset
export type Sample = {
    buggy_code: string;
    instruction: string;
    ground_truth: string;
    output_direct: string;
    output_summary: string;
    original_summary: string;
    edited_summary: string;
    result_direct: string;
    error_direct: string;
    result_summary: string;
    error_summary: string;
    [key: string]: string;
};
