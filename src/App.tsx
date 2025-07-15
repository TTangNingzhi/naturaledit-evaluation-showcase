import React, { useEffect, useState } from "react";
import CodeDiffBlock from "./components/CodeDiffBlock";
import SectionHeader from "./components/SectionHeader";
import Navigation from "./components/Navigation";
import SummaryDiff from "./components/SummaryDiff";
import { DATASETS, MODELS, TYPES } from "./constants";
import { parseJSONL } from "./utils";
import type { Sample } from "./types";

// Main App component for the result viewer
const App: React.FC = () => {
    // State for samples and navigation
    const [samples, setSamples] = useState<Sample[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    // State for dataset/model/type selection
    const [dataset, setDataset] = useState("CanItEdit");
    const [model, setModel] = useState("gpt-4o");
    const [type, setType] = useState("lazy");

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
        <div className="min-h-screen bg-gray-50 py-2 px-2">
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                {/* Top bar: app title on the far left, selectors center, navigation right */}
                <div className="mb-6 flex flex-row items-center justify-between w-full gap-4">
                    {/* App title, stylized */}
                    <span className="app-title mr-4">
                        <span className="ne-highlight ne-yellow">Natural</span><span className="ne-highlight ne-blue">Edit</span> Result Viewer
                    </span>
                    {/* Dataset/model/type selectors */}
                    <div className="flex flex-row items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-normal text-gray-600 shadow-sm" style={{ minHeight: "36px" }}>
                        {/* Dataset/model/type selectors */}
                        <span>Dataset:</span>
                        <select
                            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
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
                            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                        >
                            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="opacity-60">|</span>
                        <span>Type:</span>
                        <select
                            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            {TYPES[dataset].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    {/* Navigation (prev/next) with manual input integrated in Navigation component */}
                    <div>
                        <Navigation
                            current={current}
                            total={samples.length}
                            onPrev={() => setCurrent((i) => Math.max(0, i - 1))}
                            onNext={() => setCurrent((i) => Math.min(samples.length - 1, i + 1))}
                            onNavigate={setCurrent}
                        />
                    </div>
                </div>
                {/* Main content grid: two rows, three columns each */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* First row: Test Result, Direct Instruction Prompt, Summary-Mediated Prompt */}
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Test case results for direct and summary */}
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 flex-1 items-start">
                            {/* Test case result for direct and summary prompts */}
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
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded shadow-sm p-3 flex-1">
                            {/* Direct instruction prompt */}
                            <SectionHeader icon="📘">Direct Instruction Prompt</SectionHeader>
                            <div className="mt-1 text-sm text-gray-800 whitespace-pre-line text-left" style={{ textAlign: "left" }}>{sample.instruction}</div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Summary-Mediated Prompt (Summary Diff) */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded shadow-sm p-3 flex-1">
                            {/* Summary-mediated prompt (summary diff) */}
                            <SectionHeader icon="📙">Summary-Mediated Prompt</SectionHeader>
                            <div className="prose text-sm text-left" style={{ textAlign: "left" }}>
                                <SummaryDiff original={sample.original_summary} current={sample.edited_summary} />
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
