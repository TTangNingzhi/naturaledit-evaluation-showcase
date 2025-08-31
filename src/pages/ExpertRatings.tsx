import React, { useEffect, useMemo, useState } from "react";
import SubtaskDots from "../components/SubtaskDots";
import SummaryWithMapping from "../components/SummaryWithMapping";
import CodeWithMapping from "../components/CodeWithMapping";
import CodeDiffBlock from "../components/CodeDiffBlock";
import SummaryDiff from "../components/SummaryDiff";
import SectionHeader from "../components/SectionHeader";
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
        <div className="inline-flex rounded bg-gray-100 p-1 gap-1">
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        className={[
                            "px-2 py-1 text-sm rounded transition duration-200 font-medium cursor-pointer",
                            active
                                ? "bg-white shadow-md text-gray-800"
                                : "text-gray-600 hover:bg-gray-200 hover:text-gray-800",
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
            return { code: task.old.code, other: task.new.code };
        }
        return mode === "original"
            ? { code: task.old.code, other: task.new.code }
            : { code: task.new.code, other: task.old.code };
    }, [task, mode]);

    const detectLanguage = useMemo(() => {
        if (!task) return "python" as const;
        const path = task.path.toLowerCase();
        if (path.endsWith('.js') || path.endsWith('.jsx') || path.endsWith('.ts') || path.endsWith('.tsx')) {
            return "javascript" as const;
        }
        if (path.endsWith('.py')) {
            return "python" as const;
        }
        return "python" as const; // default fallback
    }, [task]);

    const mappingsDict = useMemo(() => {
        if (!task) return null;
        if (mode === "diff") return null;
        return mode === "original" ? task.old.mappings : task.new.mappings;
    }, [task, mode]);

    const fdIndices = tasks.map((t, i) => (t.id.startsWith("FD-") ? i : -1)).filter(i => i !== -1);
    const mpIndices = tasks.map((t, i) => (t.id.startsWith("MP-") ? i : -1)).filter(i => i !== -1);
    const fdItems = fdIndices.map(i => ({ id: tasks[i].id }));
    const mpItems = mpIndices.map(i => ({ id: tasks[i].id }));
    const fdCurrent = fdIndices.indexOf(currentIndex);
    const mpCurrent = mpIndices.indexOf(currentIndex);

    return (
        <div className="min-h-screen bg-gray-50 py-2">
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="mb-4 flex flex-col gap-2 w-full">
                    <div className="mb-2 flex flex-row items-end justify-between w-full gap-4">
                        <div className="flex items-end gap-3">
                            <span className="text-2xl font-semibold text-gray-600">⭐ Expert Ratings</span>
                        </div>
                    </div>

                    <div className="flex flex-row items-center w-full justify-between gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-normal text-gray-600 shadow-sm">
                        <div className="flex items-center">
                            <ToggleGroup
                                options={[
                                    { label: "BuggyCode", value: "original" },
                                    { label: "Diff", value: "diff" },
                                    { label: "GroundTruth", value: "new" },
                                ]}
                                value={mode}
                                onChange={(v) => setMode(v as "original" | "diff" | "new")}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Finance Dashboard</span>
                                <SubtaskDots
                                    items={fdItems}
                                    currentIndex={fdCurrent >= 0 ? fdCurrent : -1}
                                    onSelect={(i) => setCurrentIndex(fdIndices[i])}
                                />
                            </div>

                            <span className="opacity-60">|</span>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">MVP Predictor</span>
                                <SubtaskDots
                                    items={mpItems}
                                    currentIndex={mpCurrent >= 0 ? mpCurrent : -1}
                                    onSelect={(i) => setCurrentIndex(mpIndices[i])}
                                />
                            </div>
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
                                <div className="flex items-start justify-between mb-2">
                                    <SectionHeader>
                                        {mode === "diff"
                                            ? "Summary Diff"
                                            : mode === "original"
                                                ? "Summary (BuggyCode)"
                                                : "Summary (GroundTruth)"}
                                    </SectionHeader>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-gray-600 font-mono text-sm select-none">
                                            <input
                                                type="checkbox"
                                                checked={structure === "structured"}
                                                onChange={(e) => setStructure(e.target.checked ? "structured" : "unstructured")}
                                                className="form-checkbox w-5 h-5"
                                            />
                                            Structured
                                        </label>
                                        <span className="opacity-60">|</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 font-mono text-sm">
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
                                    <div className="text-xs font-mono whitespace-pre-wrap leading-5">
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

                            {mode === "diff" ? (
                                <CodeDiffBlock
                                    title="Code Diff"
                                    oldValue={task.old.code}
                                    newValue={task.new.code}
                                    language={detectLanguage}
                                    filename={headerInfo?.filename}
                                />
                            ) : (
                                <div className="bg-white rounded border border-gray-200 p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <SectionHeader>
                                            {mode === "original"
                                                ? "Code (BuggyCode)"
                                                : "Code (GroundTruth)"}
                                        </SectionHeader>
                                        {headerInfo && (
                                            <span className="text-sm text-gray-500 font-mono">
                                                {headerInfo.filename}
                                            </span>
                                        )}
                                    </div>
                                    {mappingsDict && (
                                        <CodeWithMapping
                                            code={codeContext.code}
                                            mappings={mappingsDict}
                                            summaryKey={summaryKey}
                                            activeMappingIndex={activeMappingIndex}
                                            language={detectLanguage}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExpertRatings;
