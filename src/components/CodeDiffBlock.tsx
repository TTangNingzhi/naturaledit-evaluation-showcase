import React from "react";
import DiffViewer from "react-diff-viewer";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import SectionHeader from "./SectionHeader";

interface CodeDiffBlockProps {
    title: string;
    icon?: React.ReactNode;
    oldValue: string;
    newValue: string;
    language?: "python" | "javascript";
}

const defaultStyles: Record<string, React.CSSProperties> = {
    diffContainer: {
        fontSize: "0.75rem",
        fontFamily: "monospace"
    },
    line: {
        wordBreak: "break-word"
    }
};

const CodeDiffBlock: React.FC<CodeDiffBlockProps> = ({
    title,
    icon,
    oldValue,
    newValue,
    language = "python",
}) => (
    <div className="bg-white rounded shadow p-3 border border-gray-200 flex-1">
        {/* Code diff block for code comparison */}
        <SectionHeader icon={icon}>{title}</SectionHeader>
        <DiffViewer
            oldValue={oldValue}
            newValue={newValue}
            splitView={false}
            showDiffOnly={false}
            useDarkTheme={false}
            disableWordDiff={true}
            hideLineNumbers={true}
            styles={defaultStyles}
            renderContent={code =>
                <pre
                    className="whitespace-pre-wrap text-xs text-gray-800 font-mono text-left"
                    style={{ display: "block", textAlign: "left", margin: 0, fontSize: "0.75rem" }}
                    dangerouslySetInnerHTML={{
                        __html: Prism.highlight(code, Prism.languages[language] as Prism.Grammar, language),
                    }}
                />
            }
        />
    </div>
);

export default CodeDiffBlock; 