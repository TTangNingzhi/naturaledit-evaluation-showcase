// Constants for dataset, model, and type options
export const DATASETS = ["CanItEdit", "EditEval"];
export const MODELS = ["gpt-3.5-turbo", "gpt-4o"];
export const TYPES: Record<string, string[]> = {
    CanItEdit: ["descriptive", "lazy"],
    EditEval: ["instruction"],
};
