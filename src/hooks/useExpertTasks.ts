import { useEffect, useMemo, useState } from "react";
import type {
    Granularity,
    StructType,
    MergedTask,
    TaskInput,
    TaskOutput,
    SummaryFieldKey,
} from "../types";

type UseExpertTasksState = {
    tasks: MergedTask[];
    loading: boolean;
    error?: string;
    currentIndex: number;
    setCurrentIndex: (i: number) => void;
    granularity: Granularity;
    setGranularity: (g: Granularity) => void;
    structure: StructType;
    setStructure: (s: StructType) => void;
    summaryKey: SummaryFieldKey;
};

function toSummaryKey(g: Granularity, s: StructType): SummaryFieldKey {
    return `${g}_${s}` as SummaryFieldKey;
}

export function useExpertTasks(): UseExpertTasksState {
    const [tasks, setTasks] = useState<MergedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [granularity, setGranularity] = useState<Granularity>("medium");
    const [structure, setStructure] = useState<StructType>("structured");

    // Fetch and merge input/output by id/task_id
    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(undefined);
            try {
                const [inputRes, outputRes] = await Promise.all([
                    fetch("/data/tasks-input.json"),
                    fetch("/data/tasks-output.json"),
                ]);
                const inputJson: TaskInput[] = await inputRes.json();
                const outputJson: TaskOutput[] = await outputRes.json();

                // index outputs by task_id
                const outMap = new Map<string, TaskOutput>(
                    outputJson.map((o) => [o.task_id, o])
                );

                // Preserve the order found in inputs; expect 6 items (FD-A/B/C, MP-A/B/C)
                const merged: MergedTask[] = inputJson
                    .map((inp) => {
                        const out = outMap.get(inp.id);
                        if (!out) return null;

                        const oldStart = Number(inp.old_start_line ?? "0") || 0;
                        const newStart = Number(inp.new_start_line ?? "0") || 0;

                        const m: MergedTask = {
                            id: inp.id,
                            path: inp.file_path,
                            meta: out.metadata,
                            old: {
                                code: inp.old_code,
                                context: inp.old_context,
                                startLine: oldStart,
                                summary: out.old_code.summary,
                                mappings: out.old_code.mappings,
                            },
                            new: {
                                code: inp.new_code,
                                context: inp.new_context,
                                startLine: newStart,
                                summary: out.new_code.summary,
                                mappings: out.new_code.mappings,
                            },
                        };
                        return m;
                    })
                    .filter((x): x is MergedTask => !!x);

                if (!cancelled) {
                    setTasks(merged);
                    setCurrentIndex(0);
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    const msg = e instanceof Error ? e.message : String(e);
                    setError(msg || "Failed to load expert tasks");
                    setTasks([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const summaryKey = useMemo(() => toSummaryKey(granularity, structure), [granularity, structure]);

    return {
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
    };
}
