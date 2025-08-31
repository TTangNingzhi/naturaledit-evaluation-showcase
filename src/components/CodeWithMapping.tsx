import React, { useMemo } from "react";
import Prism from "prismjs";
import DiffMatchPatch from "diff-match-patch";
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
    showLineNumbers?: boolean;
};

type Region = { start: number; end: number; mappingIndex: number };

// Enhanced non-overlapping region builder for code segments with line-priority and fuzzy fallbacks
function buildCodeRegions(
    code: string,
    mappingArr: SummaryCodeMapping[]
): Region[] {
    const regions: Region[] = [];
    // Remove the used array and overlaps check to allow multiple mappings to share code positions

    function tryMark(pos: number, len: number, mappingIndex: number): boolean {
        if (pos < 0 || len <= 0 || pos + len > code.length) return false;
        // Allow overlapping regions - multiple mappings can share the same code position
        regions.push({ start: pos, end: pos + len, mappingIndex });
        return true;
    }

    const BITAP_LIMIT = 64;
    const MIN_MATCH_SCORE = 0.85;

    for (let i = 0; i < mappingArr.length; i++) {
        const m = mappingArr[i];
        if (!m || !m.codeSegments || m.codeSegments.length === 0) continue;

        for (const seg of m.codeSegments) {
            const raw = seg?.code || "";
            const snippet = raw;
            const trimmed = snippet.trim();
            if (!trimmed) continue;

            let matched = false;

            // 1) Try to match by line number if provided
            if (!matched && typeof seg?.line === "number" && seg.line > 0) {
                const lines = code.split("\n");
                const idx = seg.line - 1;
                if (idx >= 0 && idx < lines.length) {
                    const lineText = lines[idx];
                    let foundInLine = lineText.indexOf(snippet);
                    if (foundInLine === -1 && trimmed.length > 0) {
                        foundInLine = lineText.indexOf(trimmed);
                    }
                    if (foundInLine !== -1) {
                        let globalPos = 0;
                        for (let l = 0; l < idx; l++) {
                            globalPos += lines[l].length + 1; // include newline
                        }
                        globalPos += foundInLine;
                        matched = tryMark(globalPos, snippet.length, i);
                    }
                }
            }

            // 2) Handle multi-line code segments by splitting on \n
            if (!matched && snippet.includes('\n')) {
                const lines = snippet.split('\n').map(line => line.trim());
                const codeLines = code.split('\n');

                // Try to find the starting line by matching the first line
                for (let startLine = 0; startLine <= codeLines.length - lines.length; startLine++) {
                    let allLinesMatch = true;
                    let currentPos = 0;

                    // Calculate global position for start line
                    for (let l = 0; l < startLine; l++) {
                        currentPos += codeLines[l].length + 1; // include newline
                    }

                    // Check if all lines match
                    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                        const targetLine = lines[lineIdx];
                        const codeLine = codeLines[startLine + lineIdx];

                        if (!codeLine || codeLine.trim().indexOf(targetLine) === -1) {
                            allLinesMatch = false;
                            break;
                        }
                    }

                    if (allLinesMatch) {
                        // Mark each line as a separate region - only the matching part
                        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                            const targetLine = lines[lineIdx];
                            const codeLine = codeLines[startLine + lineIdx];
                            const matchStart = codeLine.trim().indexOf(targetLine);

                            if (matchStart !== -1) {
                                // Calculate the actual start position including leading whitespace
                                let actualStart = currentPos;
                                let leadingWhitespace = 0;
                                while (leadingWhitespace < codeLine.length && /\s/.test(codeLine[leadingWhitespace])) {
                                    leadingWhitespace++;
                                }
                                actualStart += leadingWhitespace + matchStart;

                                tryMark(actualStart, targetLine.length, i);
                            }

                            // Move to next line position
                            currentPos += codeLine.length + 1; // +1 for newline
                        }
                        matched = true;
                        break;
                    }
                }
            }

            // 3) Exact occurrences (allow multiple matches for same code)
            if (!matched) {
                let from = 0;
                let found = -1;
                while (from <= code.length) {
                    found = code.indexOf(snippet, from);
                    if (found === -1) break;
                    if (tryMark(found, snippet.length, i)) {
                        matched = true;
                        // Don't break here - allow finding multiple occurrences
                        // This enables multiple mappings to reference the same code
                    }
                    from = found + 1;
                }
            }

            // 4) Trimmed exact occurrences (allow multiple matches)
            if (!matched && trimmed !== snippet) {
                let from = 0;
                let found = -1;
                while (from <= code.length) {
                    found = code.indexOf(trimmed, from);
                    if (found === -1) break;
                    if (tryMark(found, trimmed.length, i)) {
                        matched = true;
                        // Don't break here - allow finding multiple occurrences
                    }
                    from = found + 1;
                }
            }

            // 5) Bitap/fuzzy match for short snippets
            if (!matched && trimmed.length > 0 && trimmed.length <= BITAP_LIMIT) {
                try {
                    const dmp = new DiffMatchPatch();
                    const pos = dmp.match_main(code, trimmed, 0);
                    if (pos !== -1) {
                        matched = tryMark(pos, trimmed.length, i);
                    }
                } catch {
                    // ignore bitap errors
                }
            }

            // 6) Sliding-window fuzzy match for long snippets
            if (!matched && trimmed.length > BITAP_LIMIT) {
                try {
                    const window = BITAP_LIMIT;
                    const dmp = new DiffMatchPatch();
                    let bestScore = 0;
                    let bestPos = -1;
                    for (let p = 0; p <= Math.max(0, code.length - window); p++) {
                        const win = code.substr(p, window);
                        const targetSlice = trimmed.substr(0, window);
                        const diffs = dmp.diff_main(win, targetSlice);
                        dmp.diff_cleanupSemantic(diffs);
                        let editDistance = 0;
                        for (const d of diffs as [number, string][]) {
                            if (d[0] !== 0) editDistance += d[1].length;
                        }
                        const score = (window - editDistance) / window;
                        if (score > bestScore) {
                            bestScore = score;
                            bestPos = p;
                        }
                    }
                    if (bestScore >= MIN_MATCH_SCORE && bestPos !== -1) {
                        matched = tryMark(bestPos, Math.min(trimmed.length, code.length - bestPos), i);
                    }
                } catch {
                    // ignore errors
                }
            }

            // If not matched, continue to next segment (we still want to show original snippet in summary)
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
    showLineNumbers = true,
}) => {
    const mappingArr = useMemo(
        () => mappings?.[summaryKey] ?? [],
        [mappings, summaryKey]
    );

    const allRegions = useMemo(
        () => buildCodeRegions(code, mappingArr),
        [code, mappingArr]
    );

    const regions = useMemo(() => {
        if (activeMappingIndex === null) return [];
        return allRegions.filter(r => r.mappingIndex === activeMappingIndex);
    }, [allRegions, activeMappingIndex]);

    // Create highlighted code segments with mapping overlays
    const renderHighlightedCode = () => {
        if (activeMappingIndex === null || regions.length === 0) {
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
                backgroundColor: `${bg}A0`,
                borderRadius: 3,
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

    if (!showLineNumbers) {
        return (
            <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono text-left m-0" style={{ lineHeight: '1.25rem' }}>
                {renderHighlightedCode()}
            </pre>
        );
    }

    // Split code into lines for line numbering
    const lines = code.split('\n');

    return (
        <div className="flex">
            {/* Line numbers */}
            <div className="flex-shrink-0 w-8 bg-gray-50 border-r border-gray-200 select-none">
                {lines.map((_, index) => (
                    <div
                        key={index}
                        className="text-xs text-gray-500 text-right pr-2 h-5"
                        style={{ lineHeight: '1.25rem' }}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-x-auto pl-2">
                <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono text-left m-0" style={{ lineHeight: '1.25rem' }}>
                    {renderHighlightedCode()}
                </pre>
            </div>
        </div>
    );
};

export default CodeWithMapping;
