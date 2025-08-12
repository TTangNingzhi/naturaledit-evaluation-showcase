import React, { useEffect, useState } from "react";
import CodeDiffBlock from "./components/CodeDiffBlock";
import SectionHeader from "./components/SectionHeader";
import Navigation from "./components/Navigation";
import SummaryDiff from "./components/SummaryDiff";
import { DATASETS, TYPES } from "./constants";
import { parseJSONL } from "./utils";
import type { Sample } from "./types";

// Main App component for the result viewer
const App: React.FC = () => {
    // State for samples and navigation
    const [samples, setSamples] = useState<Sample[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    // State for dataset and type selection (type only for CanItEdit)
    const [dataset, setDataset] = useState("CanItEdit");
    const [type, setType] = useState("lazy");
    // Model selection
    const [model, setModel] = useState("gpt-4.1");
    // Summary controls
    const [granularity, setGranularity] = useState<"low" | "medium" | "high">("medium");
    const [structure, setStructure] = useState<"structured" | "unstructured">("structured");

    // Returns the correct file name based on dataset, model, and type (type only for CanItEdit)
    function getFileName(dataset: string, model: string, type: string) {
        if (dataset === "CanItEdit") {
            return `/data/${dataset}_${model}_${type}.jsonl`;
        } else if (dataset === "EditEval") {
            return `/data/${dataset}_${model}_instruction.jsonl`;
        }
        // Default fallback
        return "";
    }

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
                <div className="mb-6 flex flex-col gap-2 w-full">
                    <div className="flex flex-row items-center justify-between w-full gap-4">
                        {/* App title with logo, stylized */}
                        <div className="flex flex-row items-center">
                            <img src="/naturaledit.svg" alt="NaturalEdit Logo" className="h-10 w-10 mr-3" />
                            <span className="app-title mr-4">
                                <span className="ne-highlight ne-yellow">Natural</span>
                                <span className="ne-highlight ne-blue">Edit</span>
                                <span className="ne-highlight ne-gray"> Result Viewer</span>
                            </span>
                        </div>
                        {/* Navigation */}
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
                    {/* Selector row, split left and right */}
                    <div className="flex flex-row items-center w-full justify-between gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-normal text-gray-600 shadow-sm" style={{ minHeight: "36px" }}>
                        {/* Left: Dataset, Model, Type */}
                        <div className="flex flex-row items-center gap-2">
                            <span>Dataset:</span>
                            <select
                                className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                                value={dataset}
                                onChange={e => {
                                    setDataset(e.target.value);
                                    // Only set type if dataset is CanItEdit
                                    if (e.target.value === "CanItEdit") {
                                        setType(TYPES[e.target.value][0]);
                                    }
                                }}
                            >
                                {DATASETS.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                            </select>
                            {/* Only show Type selector for CanItEdit dataset */}
                            {dataset === "CanItEdit" && (
                                <>
                                    <span className="opacity-60">|</span>
                                    <span>Type:</span>
                                    <select
                                        className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        {TYPES[dataset].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </>
                            )}
                            <span className="opacity-60">|</span>
                            <span>Model:</span>
                            <select
                                className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                                value={model}
                                onChange={e => setModel(e.target.value)}
                            >
                                <option value="gpt-4.1">gpt-4.1</option>
                            </select>
                        </div>
                        {/* Right: Granularity/Structure controls */}
                        <div className="flex items-center gap-4">
                            {/* Structure checkbox */}
                            <label className="flex items-center gap-2 text-gray-600 font-mono text-sm select-none">
                                <input
                                    type="checkbox"
                                    checked={structure === "structured"}
                                    onChange={e => setStructure(e.target.checked ? "structured" : "unstructured")}
                                    className="form-checkbox w-5 h-5"
                                />
                                Structured
                            </label>
                            <span className="opacity-60">|</span>
                            {/* Granularity slider */}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 font-mono text-sm">Granularity ({granularity.charAt(0).toUpperCase() + granularity.slice(1)})</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={2}
                                    step={1}
                                    value={["low", "medium", "high"].indexOf(granularity)}
                                    onChange={e => setGranularity(["low", "medium", "high"][Number(e.target.value)] as "low" | "medium" | "high")}
                                    className="w-12 accent-gray-400"
                                    aria-label="Granularity"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main content grid: two rows, three columns each */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* First row: Test Result, Direct Instruction Prompt, Summary-Mediated Prompt */}
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Test case results for all six summary levels */}
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 flex-1 items-start">
                            <SectionHeader icon="🧪">Test Case Result</SectionHeader>
                            <div className="text-xs text-gray-800 font-mono">
                                <div className="font-semibold mb-1">Direct Instruction</div>
                                <div className="mb-2 pl-2">
                                    <span className={sample.result_direct === "PASS" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                        {sample.result_direct}
                                    </span>
                                    {sample.error_direct && (
                                        <span className="ml-2 text-red-400 text-xs whitespace-pre-line">
                                            {sample.error_direct}
                                        </span>
                                    )}
                                </div>
                                <div className="font-semibold mb-1">Summary Mediation</div>
                                {(["low_unstructured", "low_structured", "medium_unstructured", "medium_structured", "high_unstructured", "high_structured"] as (keyof typeof sample.result_summary)[]).map((field) => (
                                    <div key={field} className="mb-1 pl-2">
                                        <span>{field.replace("_", " ")}: </span>
                                        <span className={sample.result_summary[field] === "PASS" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                            {sample.result_summary[field]}
                                        </span>
                                        {sample.error_summary[field] && (
                                            <span className="ml-2 text-red-400 text-xs whitespace-pre-line">
                                                {sample.error_summary[field]}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Direct Instruction Prompt */}
                        <div className="bg-blue-50 border-l-4 border-blue-200 rounded shadow-sm p-3 flex-1">
                            <SectionHeader icon="📘">Direct Edit Instruction</SectionHeader>
                            <div className="mt-1 text-xs text-gray-800 whitespace-pre-line text-left font-mono" style={{ textAlign: "left" }}>{sample.instruction}</div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        {/* Summary-Mediated Prompt (Summary Diff) */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-200 rounded shadow-sm p-3 flex-1">
                            <SectionHeader icon="📙">
                                {`Modified Code Summary (${granularity.charAt(0).toUpperCase() + granularity.slice(1)}, ${structure.charAt(0).toUpperCase() + structure.slice(1)})`}
                            </SectionHeader>
                            <div className="prose text-xs text-left font-mono" style={{ textAlign: "left" }}>
                                <SummaryDiff
                                    original={sample.original_summary}
                                    current={sample.edited_summary}
                                    granularity={granularity}
                                    structure={structure}
                                />
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
                        title="Output (Direct Instruction)"
                        icon="🧱"
                        oldValue={sample.buggy_code}
                        newValue={sample.output_direct}
                    />
                    <CodeDiffBlock
                        title="Output (Summary Mediation)"
                        icon="🧱"
                        oldValue={sample.buggy_code}
                        newValue={sample.output_summary[`${granularity}_${structure}`] || ""}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
