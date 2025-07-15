// React component to render a diff between two summaries using diff-match-patch
import React from "react";
import DiffMatchPatch from "diff-match-patch";

type SummaryDiffProps = {
    original: string;
    current: string;
};

const SummaryDiff: React.FC<SummaryDiffProps> = ({ original, current }) => {
    const dmp = new DiffMatchPatch();
    const diffs: [number, string][] = dmp.diff_main(original, current);
    dmp.diff_cleanupSemantic(diffs);

    return (
        <>
            {diffs.map((diff: [number, string], idx: number) => {
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
            })}
        </>
    );
};

export default SummaryDiff;
