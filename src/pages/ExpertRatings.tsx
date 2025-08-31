import React, { useEffect, useMemo, useState } from "react";
import SubtaskDots from "../components/SubtaskDots";
import SummaryWithMapping from "../components/SummaryWithMapping";
import CodeWithMapping from "../components/CodeWithMapping";
import CodeDiffBlock from "../components/CodeDiffBlock";
import SummaryDiff from "../components/SummaryDiff";
import { useExpertTasks } from "../hooks/useExpertTasks";
import type { Granularity, StructType } from "../types";

const ToggleGroup = ({
    label,
    options,
    value,
    onChange,
}: {
    label?: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
}) => (
    <div className="flex items-center gap-2">
        {label && <span className="text-xs text-gray-500">{label}</span>}
        <div className="inline-flex rounded bg-gray-100 p-1">
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        className={[
                            "px-2 py-1 text-xs rounded transition",
                            active ? "bg-white shadow border border-gray-200" : "text-gray-600 hover:bg-gray-200",
                        ].join(" ")}
                        onClick={() => onChange(opt.value)}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);

const ExpertRatings: React.FC = () => {
    const {
        tasks,
        loading,
        error,
        currentIndex,
        setCurrentIndex,
        granularity,
        setGranularity,
        structure,
        setStructure,
        summaryKey,
    } = useExpertTasks();

    const [mode, setMode] = useState<"original" | "diff" | "new">("original");
    const [activeMappingIndex, setActiveMappingIndex] = useState<number | null>(null);

    useEffect(() => setActiveMappingIndex(null), [mode, currentIndex, summaryKey]);

    const task = tasks[currentIndex];

    const headerInfo = useMemo(() => {
        if (!task) return null;
        const filename = task.path.split("/").pop() || task.path;
        return { id: task.id, filename, path: task.path };
    }, [task]);

    const codeContext = useMemo(() => {
        if (!task) return { code: "", other: "" };
        if (mode === "diff") {
            return { code: task.old.context, other: task.new.context };
        }
        return mode === "original"
            ? { code: task.old.context, other: task.new.context }
            : { code: task.new.context, other: task.old.context };
    }, [task, mode]);

    const mappingsDict = useMemo(() => {
        if (!task) return null;
        if (mode === "diff") return null;
        return mode === "original" ? task.old.mappings : task.new.mappings;
    }, [task, mode]);

    return (
        <div className="min-h-screen bg-gray-50 py-2">
            <div className="w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="mb-3 flex flex-col gap-3">
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex items-end gap-3">
                            <span className="text-2xl font-semibold text-gray-700">⭐ Expert Ratings</span>
                            {headerInfo && (
                                <span className="text-xs text-gray-500 font-mono">
                                    {headerInfo.id} • {headerInfo.filename}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <ToggleGroup
                                label="Mode"
                                options={[
                                    { label: "Original", value: "original" },
                                    { label: "Diff", value: "diff" },
                                    { label: "New", value: "new" },
                                ]}
                                value={mode}
                                onChange={(v) => setMode(v as "original" | "diff" | "new")}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Subtasks</span>
                            <SubtaskDots
                                items={tasks.map((t) => ({ id: t.id }))}
                                currentIndex={currentIndex}
                                onSelect={(i) => setCurrentIndex(i)}
                            />
                        </div>
                        {/* No standalone granularity/structure controls here */}
                    </div>
                </div>

                {loading && (
                    <div className="text-sm text-gray-500">Loading tasks…</div>
                )}
                {error && (
                    <div className="text-sm text-red-600">Error: {error}</div>
                )}
                {!loading && !error && !task && (
                    <div className="text-sm text-gray-500">No tasks available.</div>
                )}

                {!loading && !error && task && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded border border-gray-200 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm font-semibold text-gray-700">
                                        {mode === "diff"
                                            ? "Summary (original → new) diff"
                                            : `Summary (${mode})`}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-gray-600 font-mono text-xs select-none">
                                            <input
                                                type="checkbox"
                                                checked={structure === "structured"}
                                                onChange={(e) => setStructure(e.target.checked ? "structured" : "unstructured")}
                                                className="form-checkbox w-4 h-4"
                                            />
                                            Structured
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 font-mono text-xs">
                                                Granularity ({granularity.charAt(0).toUpperCase() + granularity.slice(1)})
                                            </span>
                                            <input
                                                type="range"
                                                min={0}
                                                max={2}
                                                step={1}
                                                value={["low", "medium", "high"].indexOf(granularity)}
                                                onChange={(e) =>
                                                    setGranularity(
                                                        (["low", "medium", "high"][Number(e.target.value)] as Granularity)
                                                    )
                                                }
                                                className="w-12 accent-gray-400"
                                                aria-label="Granularity"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {mode === "diff" ? (
                                    <div className="text-sm font-mono whitespace-pre-wrap leading-6">
                                        <SummaryDiff
                                            original={task.old.summary}
                                            current={task.new.summary}
                                            granularity={granularity}
                                            structure={structure as StructType}
                                        />
                                    </div>
                                ) : (
                                    mappingsDict && (
                                        <SummaryWithMapping
                                            mode={mode === "original" ? "original" : "new"}
                                            originalSummary={task.old.summary}
                                            newSummary={task.new.summary}
                                            mappings={mappingsDict}
                                            summaryKey={summaryKey}
                                            activeMappingIndex={activeMappingIndex}
                                            setActiveMappingIndex={setActiveMappingIndex}
                                        />
                                    )
                                )}
                            </div>

                            <div className="bg-white rounded border border-gray-200 p-3">
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    {mode === "diff" ? "Code (old ↔ new) diff" : `Code (${mode}) context`}
                                </div>
                                {mode === "diff" ? (
                                    <CodeDiffBlock
                                        title="Code diff"
                                        oldValue={task.old.context}
                                        newValue={task.new.context}
                                    />
                                ) : (
                                    mappingsDict && (
                                        <CodeWithMapping
                                            code={codeContext.code}
                                            mappings={mappingsDict}
                                            summaryKey={summaryKey}
                                            activeMappingIndex={activeMappingIndex}
                                            setActiveMappingIndex={setActiveMappingIndex}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExpertRatings;
