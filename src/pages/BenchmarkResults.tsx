import React, { useState } from "react";
import CodeDiffBlock from "../components/CodeDiffBlock";
import SectionHeader from "../components/SectionHeader";
import Navigation from "../components/Navigation";
import SummaryDiff from "../components/SummaryDiff";
import { useSamples } from "../hooks/useSamples";
import type { Sample } from "../types";

/**
 * BenchmarkResults page
 * - Owns sample state via useSamples hook
 * - Provides controls for granularity & structure
 * - Renders the benchmark layout previously in App.tsx
 */
const BenchmarkResults: React.FC = () => {
    const {
        samples,
        current,
        setCurrent,
        loading,
        dataset,
        setDataset,
        type,
        setType,
        model,
        setModel,
        DATASETS,
        TYPES,
    } = useSamples();

    const [granularity, setGranularity] = useState<"low" | "medium" | "high">("medium");
    const [structure, setStructure] = useState<"structured" | "unstructured">("structured");

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

    const sample: Sample = samples[current];

    return (
        <div className="min-h-screen bg-gray-50 py-2">
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="mb-4 flex flex-col gap-2 w-full">
                    <div className="mb-2 flex flex-row items-end justify-between w-full gap-4">
                        <div className="flex flex-row items-end">
                            <span className="text-2xl font-semibold text-gray-600">🏁 Benchmark Results</span>
                        </div>
                        <Navigation
                            current={current}
                            total={samples.length}
                            onPrev={() => setCurrent((i) => Math.max(0, i - 1))}
                            onNext={() => setCurrent((i) => Math.min(samples.length - 1, i + 1))}
                            onNavigate={setCurrent}
                        />
                    </div>

                    <div className="flex flex-row items-center w-full justify-between gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-normal text-gray-600 shadow-sm" style={{ minHeight: "36px" }}>
                        <div className="flex flex-row items-center gap-2">
                            <span>Dataset:</span>
                            <select
                                className="mx-1 px-2 py-1 rounded border border-gray-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                                value={dataset}
                                onChange={e => {
                                    setDataset(e.target.value);
                                    if (e.target.value === "CanItEdit") {
                                        setType(TYPES[e.target.value][0]);
                                    }
                                }}
                            >
                                {DATASETS.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                            </select>
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

                        <div className="flex items-center gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 flex-1 items-start">
                            <SectionHeader>Test Case Result</SectionHeader>
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
                        <div className="bg-blue-50 border border-blue-100 rounded shadow-sm p-3 flex-1">
                            <SectionHeader>Direct Edit Instruction</SectionHeader>
                            <div className="mt-1 text-xs text-gray-800 whitespace-pre-line text-left font-mono" style={{ textAlign: "left" }}>{sample.instruction}</div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-1 flex flex-col">
                        <div className="bg-yellow-50 border border-yellow-200 rounded shadow-sm p-3 flex-1">
                            <SectionHeader>
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
                    <CodeDiffBlock
                        title="Ground Truth"
                        oldValue={sample.buggy_code}
                        newValue={sample.ground_truth}
                        language="python"
                    />
                    <CodeDiffBlock
                        title="Output (Direct Instruction)"
                        oldValue={sample.buggy_code}
                        newValue={sample.output_direct}
                        language="python"
                    />
                    <CodeDiffBlock
                        title="Output (Summary Mediation)"
                        oldValue={sample.buggy_code}
                        newValue={sample.output_summary[`${granularity}_${structure}`] || ""}
                        language="python"
                    />
                </div>
            </div>
        </div>
    );
};

export default BenchmarkResults;
