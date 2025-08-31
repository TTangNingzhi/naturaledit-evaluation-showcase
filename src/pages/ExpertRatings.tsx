import React, { useEffect, useMemo, useState } from "react";
import SubtaskDots from "../components/SubtaskDots";
import SummaryWithMapping from "../components/SummaryWithMapping";
import CodeWithMapping from "../components/CodeWithMapping";
import CodeDiffBlock from "../components/CodeDiffBlock";
import RatingsPanel from "../components/RatingsPanel";
import SummaryDiff from "../components/SummaryDiff";
import { useExpertTasks } from "../hooks/useExpertTasks";
import type { Granularity, StructType } from "../types";

const ToggleGroup = ({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
}) => (
    <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{label}</span>
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

    const [version, setVersion] = useState<"original" | "new">("original");
    const [viewMode, setViewMode] = useState<"mappings" | "diff">("mappings");
    const [activeMappingIndex, setActiveMappingIndex] = useState<number | null>(null);

    // Reset mapping highlight when mode changes
    useEffect(() => setActiveMappingIndex(null), [version, viewMode, currentIndex, summaryKey]);

    const task = tasks[currentIndex];

    const headerInfo = useMemo(() => {
        if (!task) return null;
        const filename = task.path.split("/").pop() || task.path;
        return { id: task.id, filename, path: task.path };
    }, [task]);

    const summaryPair = useMemo(() => {
        if (!task) return null;
        return {
            original: task.old.summary,
            current: version === "original" ? task.old.summary : task.new.summary,
        };
    }, [task, version]);

    const codeContext = useMemo(() => {
        if (!task) return { code: "", other: "" };
        if (viewMode === "diff") {
            return { code: task.old.context, other: task.new.context };
        }
        return {
            code: version === "original" ? task.old.context : task.new.context,
            other: version === "original" ? task.new.context : task.old.context,
        };
    }, [task, version, viewMode]);

    const mappingsDict = useMemo(() => {
        if (!task) return null;
        return version === "original" ? task.old.mappings : task.new.mappings;
    }, [task, version]);

    const granularityOptions: { label: string; value: Granularity }[] = [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
    ];
    const structureOptions: { label: string; value: StructType }[] = [
        { label: "Structured", value: "structured" },
        { label: "Unstructured", value: "unstructured" },
    ];

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
                                label="Version"
                                options={[
                                    { label: "Original", value: "original" },
                                    { label: "New", value: "new" },
                                ]}
                                value={version}
                                onChange={(v) => setVersion(v as "original" | "new")}
                            />
                            <ToggleGroup
                                label="View"
                                options={[
                                    { label: "Mappings", value: "mappings" },
                                    { label: "Diff (code)", value: "diff" },
                                ]}
                                value={viewMode}
                                onChange={(v) => setViewMode(v as "mappings" | "diff")}
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
                        <div className="flex items-center gap-4">
                            <ToggleGroup
                                label="Granularity"
                                options={granularityOptions}
                                value={granularity}
                                onChange={(v) => setGranularity(v as Granularity)}
                            />
                            <ToggleGroup
                                label="Structure"
                                options={structureOptions}
                                value={structure}
                                onChange={(v) => setStructure(v as StructType)}
                            />
                        </div>
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
                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                    {viewMode === "diff"
                                        ? "Summary (original → new) diff"
                                        : `Summary (${version}) • ${granularity}/${structure}`}
                                </div>
                                {viewMode === "diff" ? (
                                    <div className="text-sm font-mono whitespace-pre-wrap leading-6">
                                        <SummaryDiff
                                            original={task.old.summary}
                                            current={task.new.summary}
                                            granularity={granularity}
                                            structure={structure}
                                        />
                                    </div>
                                ) : (
                                    summaryPair &&
                                    mappingsDict && (
                                        <SummaryWithMapping
                                            mode={version}
                                            originalSummary={summaryPair.original}
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
                                    {viewMode === "diff"
                                        ? "Code (old ↔ new) diff"
                                        : `Code (${version}) context`}
                                </div>
                                {viewMode === "diff" ? (
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

                        <RatingsPanel tasksCount={tasks.length} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ExpertRatings;
