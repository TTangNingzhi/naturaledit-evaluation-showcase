import React, { useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import type { SummaryCodeMapping, SummaryFieldKey } from "../types";

type CodeWithMappingProps = {
    code: string;
    mappings: Record<SummaryFieldKey, SummaryCodeMapping[]>;
    summaryKey: SummaryFieldKey;
    activeMappingIndex: number | null;
    language?: "python" | "javascript";
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
    language = "python",
}) => {
    const mappingArr = mappings?.[summaryKey] || [];

    const regions = useMemo(
        () => buildCodeRegions(code, mappingArr),
        [code, mappingArr]
    );

    // Create highlighted code segments with mapping overlays
    const renderHighlightedCode = () => {
        if (regions.length === 0) {
            // No mappings, just return highlighted code
            const highlightedCode = Prism.highlight(code, Prism.languages[language] as Prism.Grammar, language);
            return <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />;
        }

        const nodes: React.ReactNode[] = [];
        let cursor = 0;

        for (let i = 0; i < regions.length; i++) {
            const r = regions[i];

            // Plain text before the region
            if (cursor < r.start) {
                const plain = code.slice(cursor, r.start);
                if (plain) {
                    const highlightedPlain = Prism.highlight(plain, Prism.languages[language] as Prism.Grammar, language);
                    nodes.push(
                        <span
                            key={`plain-${cursor}`}
                            dangerouslySetInnerHTML={{ __html: highlightedPlain }}
                        />
                    );
                }
                cursor = r.start;
            }

            // Highlighted region with mapping color
            const text = code.slice(r.start, r.end);
            const highlightedText = Prism.highlight(text, Prism.languages[language] as Prism.Grammar, language);
            const bg = COLORS[r.mappingIndex % COLORS.length];
            const style: React.CSSProperties = {
                backgroundColor: activeMappingIndex === r.mappingIndex ? bg : `${bg}80`,
                borderRadius: 3,
                padding: "0 2px",
                margin: "0 1px",
                display: "inline-block",
            };

            nodes.push(
                <span
                    key={`map-${r.mappingIndex}-${r.start}`}
                    style={style}
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
            );
            cursor = r.end;
        }

        // Remainder
        if (cursor < code.length) {
            const remainder = code.slice(cursor);
            const highlightedRemainder = Prism.highlight(remainder, Prism.languages[language] as Prism.Grammar, language);
            nodes.push(
                <span
                    key={`plain-${cursor}`}
                    dangerouslySetInnerHTML={{ __html: highlightedRemainder }}
                />
            );
        }

        return nodes;
    };

    return (
        <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono text-left leading-6 m-0">
            {renderHighlightedCode()}
        </pre>
    );
};

export default CodeWithMapping;
