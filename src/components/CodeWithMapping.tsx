import React, { useMemo } from "react";
import type { SummaryCodeMapping, SummaryFieldKey } from "../types";

type CodeWithMappingProps = {
    code: string;
    mappings: Record<SummaryFieldKey, SummaryCodeMapping[]>;
    summaryKey: SummaryFieldKey;
    activeMappingIndex: number | null;
    setActiveMappingIndex: (idx: number | null) => void;
};

type Region = { start: number; end: number; mappingIndex: number };

// Simple non-overlapping region builder for code segments
function buildCodeRegions(
    code: string,
    mappingArr: SummaryCodeMapping[]
): Region[] {
    const regions: Region[] = [];
    const used: Array<[number, number]> = [];

    const overlaps = (a: number, b: number) =>
        used.some(([uA, uB]) => !(b <= uA || a >= uB));

    for (let i = 0; i < mappingArr.length; i++) {
        const m = mappingArr[i];
        if (!m || !m.codeSegments || m.codeSegments.length === 0) continue;

        for (const seg of m.codeSegments) {
            const snippet = seg?.code || "";
            if (!snippet) continue;

            // Try to find a non-overlapping occurrence in the code
            let from = 0;
            let found = -1;
            while (from <= code.length) {
                found = code.indexOf(snippet, from);
                if (found === -1) break;
                const end = found + snippet.length;
                if (!overlaps(found, end)) {
                    regions.push({ start: found, end, mappingIndex: i });
                    used.push([found, end]);
                    break;
                }
                from = found + 1;
            }
        }
    }
    // Sort by start
    regions.sort((a, b) => a.start - b.start);
    return regions;
}

const COLORS = [
    "#FFE08A", "#B5E8A3", "#A3D8F4", "#F4B6C2", "#D7BCE8",
    "#FFD6A5", "#C9F5D3", "#CFE8FF", "#FAD2E1", "#E3D0FF",
];

const CodeWithMapping: React.FC<CodeWithMappingProps> = ({
    code,
    mappings,
    summaryKey,
    activeMappingIndex,
    setActiveMappingIndex,
}) => {
    const mappingArr = mappings?.[summaryKey] || [];

    const regions = useMemo(
        () => buildCodeRegions(code, mappingArr),
        [code, mappingArr]
    );

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    for (let i = 0; i < regions.length; i++) {
        const r = regions[i];
        // Plain text before the region
        if (cursor < r.start) {
            const plain = code.slice(cursor, r.start);
            if (plain) nodes.push(<span key={`plain-${cursor}`}>{plain}</span>);
            cursor = r.start;
        }
        // Highlighted region
        const text = code.slice(r.start, r.end);
        const bg = COLORS[r.mappingIndex % COLORS.length];
        const style: React.CSSProperties = {
            backgroundColor: activeMappingIndex === r.mappingIndex ? bg : `${bg}80`,
            borderRadius: 3,
            padding: "0 2px",
            margin: "0 1px",
            cursor: "pointer",
        };
        nodes.push(
            <span
                key={`map-${r.mappingIndex}-${r.start}`}
                style={style}
                onMouseEnter={() => setActiveMappingIndex(r.mappingIndex)}
                onMouseLeave={() => setActiveMappingIndex(null)}
            >
                {text}
            </span>
        );
        cursor = r.end;
    }
    // Remainder
    if (cursor < code.length) {
        nodes.push(<span key={`plain-${cursor}`}>{code.slice(cursor)}</span>);
    }

    return (
        <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono text-left leading-6 m-0">
            {nodes}
        </pre>
    );
};

export default CodeWithMapping;
