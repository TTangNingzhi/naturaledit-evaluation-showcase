import React from "react";
import type { SummaryObject, SummaryCodeMapping, SummaryFieldKey } from "../types";
import { renderDiffedTextWithMapping } from "../utils/diffRender";

type SummaryWithMappingProps = {
    mode: "original" | "new";
    originalSummary: SummaryObject;
    newSummary: SummaryObject;
    mappings: Record<SummaryFieldKey, SummaryCodeMapping[]>;
    summaryKey: SummaryFieldKey;
    activeMappingIndex: number | null;
    setActiveMappingIndex: (idx: number | null) => void;
};

const SummaryWithMapping: React.FC<SummaryWithMappingProps> = ({
    mode,
    originalSummary,
    newSummary,
    mappings,
    summaryKey,
    activeMappingIndex,
    setActiveMappingIndex,
}) => {
    const oldText = originalSummary?.[summaryKey] || "";
    const currentText = mode === "original" ? oldText : newSummary?.[summaryKey] || "";
    const mappingArr = mappings?.[summaryKey] || [];

    // For original mode we do not want gold inserts; pass oldText === currentText
    const left = mode === "original" ? currentText : oldText;
    const right = currentText;

    const activeMapping =
        activeMappingIndex !== null && typeof activeMappingIndex === "number"
            ? mappingArr[activeMappingIndex]
            : undefined;

    return (
        <div className="text-xs font-mono whitespace-pre-wrap leading-5">
            {renderDiffedTextWithMapping(
                left,
                right,
                mappingArr,
                activeMappingIndex,
                (i) => setActiveMappingIndex(i)
            )}

            {activeMappingIndex !== null && activeMapping && Array.isArray(activeMapping.codeSegments) && activeMapping.codeSegments.length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono">
                    {activeMapping.codeSegments.map((seg, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="text-gray-500 text-[11px]">Line {seg?.line ?? "?"}</div>
                            <pre className="whitespace-pre-wrap m-0 text-[12px]">{seg?.code ?? ""}</pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SummaryWithMapping;
