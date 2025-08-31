import React from "react";
import DiffMatchPatch from "diff-match-patch";
import type { SummaryCodeMapping } from "../types";

const INSERT_COLOR = "#DAA520";

type MappingWithIndex = (SummaryCodeMapping & { disambigIndex?: number });

export function renderDiffedText(oldText: string, newText: string, insertColor: string = INSERT_COLOR): React.ReactNode {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(oldText || "", newText || "");
    dmp.diff_cleanupSemantic(diffs);
    return (
        <>
            {diffs.map(([op, data]: [number, string], idx: number) =>
                op === DiffMatchPatch.DIFF_INSERT ? (
                    <span key={idx} style={{ color: insertColor }}>{data}</span>
                ) : op === DiffMatchPatch.DIFF_DELETE ? null : (
                    <span key={idx}>{data}</span>
                )
            )}
        </>
    );
}

export function renderDiffedTextWithMapping(
    oldText: string,
    newText: string,
    mappings: MappingWithIndex[] = [],
    activeMappingIndex?: number | null,
    onMappingHover?: (index: number | null) => void,
    insertColor: string = INSERT_COLOR
): React.ReactNode {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(oldText || "", newText || "");
    dmp.diff_cleanupSemantic(diffs);

    type DiffRegion = { start: number; end: number; type: "equal" | "insert" };
    const diffRegions: DiffRegion[] = [];
    let cursor = 0;
    for (const [op, data] of diffs as [number, string][]) {
        if (op === DiffMatchPatch.DIFF_DELETE) continue;
        const len = data.length;
        diffRegions.push({
            start: cursor,
            end: cursor + len,
            type: op === DiffMatchPatch.DIFF_INSERT ? "insert" : "equal",
        });
        cursor += len;
    }

    type MappingRegion = { start: number; end: number; mappingIndex: number };
    const mappingRegions: MappingRegion[] = [];
    if (mappings && mappings.length > 0 && newText) {
        const used: Array<[number, number]> = [];
        const overlaps = (a: number, b: number) =>
            used.some(([uA, uB]) => !(b <= uA || a >= uB));

        function findNthOccurrence(str: string, subStr: string, n: number): number {
            if (!subStr) return -1;
            let idx = -1;
            let count = 0;
            while (count < n) {
                idx = str.indexOf(subStr, idx + 1);
                if (idx === -1) return -1;
                count++;
            }
            return idx;
        }

        for (let i = 0; i < mappings.length; i++) {
            const comp = mappings[i]?.summaryComponent || "";
            const disambigIndex = mappings[i]?.disambigIndex || 1;
            if (!comp) continue;
            const start = findNthOccurrence(newText, comp, disambigIndex);
            if (start !== -1) {
                const end = start + comp.length;
                if (!overlaps(start, end)) {
                    mappingRegions.push({ start, end, mappingIndex: i });
                    used.push([start, end]);
                }
            }
        }
        mappingRegions.sort((a, b) => a.start - b.start);
    }

    function renderDiffColored(start: number, end: number, keyPrefix: string) {
        const nodes: React.ReactNode[] = [];
        let idx = 0;
        for (const region of diffRegions) {
            if (region.end <= start) continue;
            if (region.start >= end) break;
            const segStart = Math.max(region.start, start);
            const segEnd = Math.min(region.end, end);
            if (segStart >= segEnd) continue;
            const text = newText.slice(segStart, segEnd);
            if (!text) continue;
            if (region.type === "insert") {
                nodes.push(
                    <span key={`${keyPrefix}-ins-${idx}`} style={{ color: insertColor }}>
                        {text}
                    </span>
                );
            } else {
                nodes.push(<span key={`${keyPrefix}-eq-${idx}`}>{text}</span>);
            }
            idx++;
        }
        return nodes;
    }

    const output: React.ReactNode[] = [];
    let pos = 0;
    let regionIdx = 0;

    const COLORS = [
        "#FFE08A", "#B5E8A3", "#A3D8F4", "#F4B6C2", "#D7BCE8",
        "#FFD6A5", "#C9F5D3", "#CFE8FF", "#FAD2E1", "#E3D0FF",
    ];

    while (pos < newText.length) {
        const next =
            mappingRegions[regionIdx] && mappingRegions[regionIdx].start >= pos
                ? mappingRegions[regionIdx]
                : mappingRegions.find((m) => m.start >= pos);

        if (next && next.start === pos) {
            const { start, end, mappingIndex } = next;
            const bg = COLORS[mappingIndex % COLORS.length];
            const style: React.CSSProperties = {
                backgroundColor: activeMappingIndex === mappingIndex ? bg : `${bg}80`,
                borderRadius: 3,
                padding: "0 2px",
                margin: "0 1px",
                cursor: "pointer",
            };
            output.push(
                <span
                    key={`map-${mappingIndex}-${start}`}
                    style={style}
                    onMouseEnter={() => onMappingHover && onMappingHover(mappingIndex)}
                    onMouseLeave={() => onMappingHover && onMappingHover(null)}
                >
                    {renderDiffColored(start, end, `map-${mappingIndex}-${start}`)}
                </span>
            );
            pos = end;
            const nextIdx = mappingRegions.findIndex((m) => m.start > pos);
            regionIdx = nextIdx !== -1 ? nextIdx : mappingRegions.length;
        } else {
            const nextStart = next ? next.start : newText.length;
            output.push(...renderDiffColored(pos, nextStart, `plain-${pos}`));
            pos = nextStart;
        }
    }

    return <>{output}</>;
}
