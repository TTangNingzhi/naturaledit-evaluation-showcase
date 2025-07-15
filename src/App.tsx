import React, { useEffect, useState } from "react";
import "./App.css";
import CodeDiffBlock from "./components/CodeDiffBlock";

// Types for the JSONL sample
type Sample = {
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

function parseJSONL(text: string): Sample[] {
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

import DiffMatchPatch from "diff-match-patch";

// Summary diff using diff-match-patch for better accuracy and clarity
function summaryDiff(original: string, current: string) {
    const dmp = new DiffMatchPatch();
    const diffs: [number, string][] = dmp.diff_main(original, current);
    dmp.diff_cleanupSemantic(diffs);

    return diffs.map((diff: [number, string], idx: number) => {
        const [op, text] = diff;
        if (op === DiffMatchPatch.DIFF_INSERT) {
            // Addition: green (no background)
            return (
                <span
                    key={idx}
                    style={{
                        color: "var(--vscode-charts-green, #008000)",
                        fontWeight: 500,
                    }}
                >
                    {text}
                </span>
            );
        } else if (op === DiffMatchPatch.DIFF_DELETE) {
            // Deletion: red with strikethrough (no background)
            return (
                <span
                    key={idx}
                    style={{
                        color: "var(--vscode-charts-red, #d32f2f)",
                        textDecoration: "line-through",
                        fontWeight: 500,
                    }}
                >
                    {text}
                </span>
            );
        } else {
            // Unchanged: default
            return <span key={idx}>{text}</span>;
        }
    });
}

const SectionHeader: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="font-semibold text-base mb-2 text-gray-700 flex items-center gap-2">
        {icon}
        {" "}
        {children}
    </div>
);


const Navigation: React.FC<{
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
}> = ({ current, total, onPrev, onNext }) => (
    // English comment: Navigation bar with icon buttons for previous/next
    <div className="flex items-center gap-2">
        <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow transition hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onPrev}
            disabled={current === 0}
            aria-label="Previous"
        >
            {/* Left arrow SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M13 16l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
        <span className="text-gray-600 text-sm font-mono min-w-[56px] text-center select-none">
            {current + 1} / {total}
        </span>
        <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow transition hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onNext}
            disabled={current === total - 1}
            aria-label="Next"
        >
            {/* Right arrow SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    </div>
);

// Dataset/model/type options
const DATASETS = ["CanItEdit", "EditEval"];
const MODELS = ["gpt-3.5-turbo", "gpt-4o"];
const TYPES: Record<string, string[]> = {
    CanItEdit: ["descriptive", "lazy"],
    EditEval: ["instruction"],
};

const App: React.FC = () => {
    // State for samples and navigation
    const [samples, setSamples] = useState<Sample[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    // State for dataset/model/type selection
    const [dataset, setDataset] = useState("CanItEdit");
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [type, setType] = useState("descriptive");

    // Helper to get the file name based on selection
    function getFileName(dataset: string, model: string, type: string) {
        return `/data/${dataset}_${model}_${type}.jsonl`;
    }

    // Load data when selection changes
    useEffect(() => {
        setLoading(true);
        fetch(getFileName(dataset, model, type))
            .then((res) => res.text())
            .then((text) => {
                setSamples(parseJSONL(text));
                setCurrent(0);
                setLoading(false);
            })
            .catch(() => {
                setSamples([]);
                setCurrent(0);
                setLoading(false);
            });
    }, [dataset, model, type]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-lg text-gray-500">
                Loading...
            </div>
        );
    }

    if (!samples.length) {
        return (
            <div className="flex items-center justify-center h-screen text-lg text-red-500">
                No samples found.
            </div>
        );
    }

    const sample = samples[current];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-2">
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                {/* Top bar: selectors on the left, navigation on the right */}
                <div className="mb-6 flex flex-row items-center justify-between w-full gap-4">
                    {/* Left: dataset/model/type selectors */}
                    <div className="flex flex-row items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-mono text-base font-medium text-gray-700 shadow-sm" style={{ minHeight: "40px" }}>
                        {/* English comment: Dataset/model/type selectors */}
                        <span>Dataset:</span>
                        <select
                            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            value={dataset}
                            onChange={e => {
                                setDataset(e.target.value);
                                setType(TYPES[e.target.value][0]); // Reset type when dataset changes
                            }}
                        >
                            {DATASETS.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                        </select>
                        <span className="opacity-60">|</span>
                        <span>Model:</span>
                        <select
                            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                        >
                            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="opacity-60">|</span>
                        <span>Type:</span>
                        <select
                            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            {TYPES[dataset].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    {/* Right: navigation buttons */}
                    <div>
                        {/* English comment: Navigation (prev/next) */}
                        <Navigation
                            current={current}
                            total={samples.length}
                            onPrev={() => setCurrent((i) => Math.max(0, i - 1))}
                            onNext={() => setCurrent((i) => Math.min(samples.length - 1, i + 1))}
                        />
                    </div>
                </div>
                {/* Main content grid: two rows, three columns each */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* First row: Test Result, Direct Instruction Prompt, Summary-Mediated Prompt */}
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Test case results for direct and summary */}
                        <div className="bg-gray-50 border rounded p-3 mb-4 flex flex-col items-start">
                            {/* English comment: Test case result for direct and summary prompts */}
                            <SectionHeader icon="🧪">Test Case Result</SectionHeader>
                            <div className="text-xs text-gray-800 mb-2">
                                <span className="font-mono">Direct Instruction Prompting: </span>
                                <span className={sample.result_direct === "PASS" ? "text-green-600" : "text-red-600"}>
                                    {sample.result_direct}
                                </span>
                                {sample.error_direct && (
                                    <div className="mt-1 text-red-500 text-xs whitespace-pre-line">
                                        {sample.error_direct}
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-800">
                                <span className="font-mono">Summary-Mediated Prompting: </span>
                                <span className={sample.result_summary === "PASS" ? "text-green-600" : "text-red-600"}>
                                    {sample.result_summary}
                                </span>
                                {sample.error_summary && (
                                    <div className="mt-1 text-red-500 text-xs whitespace-pre-line">
                                        {sample.error_summary}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Direct Instruction Prompt */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded shadow-sm p-3 flex-1">
                            {/* English comment: Direct instruction prompt */}
                            <SectionHeader icon="🟨">Direct Instruction Prompt</SectionHeader>
                            <div className="mt-1 text-sm text-gray-800 whitespace-pre-line text-left" style={{ textAlign: "left" }}>{sample.instruction}</div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Summary-Mediated Prompt (Summary Diff) */}
                        <div className="bg-white border rounded shadow-sm p-3 flex-1">
                            {/* English comment: Summary-mediated prompt (summary diff) */}
                            <SectionHeader icon="📙">Summary-Mediated Prompt</SectionHeader>
                            <div className="prose text-sm text-left" style={{ textAlign: "left" }}>
                                {summaryDiff(sample.original_summary, sample.edited_summary)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Second row: Ground Truth, Output Direct, Output Summary */}
                    <CodeDiffBlock
                        title="Ground Truth"
                        icon="🧱"
                        oldValue={sample.buggy_code}
                        newValue={sample.ground_truth}
                    />
                    <CodeDiffBlock
                        title="Output (Direct Instruction Prompting)"
                        icon="🧱"
                        oldValue={sample.buggy_code}
                        newValue={sample.output_direct}
                    />
                    <CodeDiffBlock
                        title="Output (Summary-Mediated Prompting)"
                        icon="🧱"
                        oldValue={sample.buggy_code}
                        newValue={sample.output_summary}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
