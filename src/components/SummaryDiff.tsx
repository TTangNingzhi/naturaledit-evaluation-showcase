// React component to render a diff between two summaries using diff-match-patch
import React from "react";
import DiffMatchPatch from "diff-match-patch";
import type { SummaryObject } from "../types";

type Granularity = "low" | "medium" | "high";
type Structure = "structured" | "unstructured";

type SummaryDiffProps = {
    original: SummaryObject;
    current: SummaryObject;
    granularity: Granularity;
    structure: Structure;
};

const SummaryDiff: React.FC<SummaryDiffProps> = ({
    original,
    current,
    granularity,
    structure,
}) => {
    const field = `${granularity}_${structure}` as keyof SummaryObject;
    const originalText = original[field] || "";
    const currentText = current[field] || "";

    const dmp = new DiffMatchPatch();
    const diffs: [number, string][] = dmp.diff_main(originalText, currentText);
    dmp.diff_cleanupSemantic(diffs);

    return (
        <div style={{ whiteSpace: "pre-wrap" }}>
            {diffs.map((diff: [number, string], idx: number) => {
                const [op, text] = diff;
                if (op === DiffMatchPatch.DIFF_INSERT) {
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
                    return <span key={idx}>{text}</span>;
                }
            })}
        </div>
    );
};

export default SummaryDiff;
