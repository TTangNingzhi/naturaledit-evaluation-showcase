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

    return (
        <div className="text-sm font-mono whitespace-pre-wrap leading-6">
            {renderDiffedTextWithMapping(
                left,
                right,
                mappingArr,
                activeMappingIndex,
                (i) => setActiveMappingIndex(i)
            )}
        </div>
    );
};

export default SummaryWithMapping;
