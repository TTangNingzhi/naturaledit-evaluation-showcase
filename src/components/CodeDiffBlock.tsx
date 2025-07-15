import React from "react";
import DiffViewer from "react-diff-viewer";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";

interface CodeDiffBlockProps {
    title: string;
    icon?: React.ReactNode;
    oldValue: string;
    newValue: string;
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
}) => (
    <div className="bg-white rounded shadow p-2 border border-gray-200 flex-1">
        {/* English comment: Code diff block for code comparison */}
        <div className="font-semibold text-base mb-2 text-gray-700 flex items-center gap-2">
            {icon}
            {" "}
            {title}
        </div>
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
                        __html: Prism.highlight(code, Prism.languages.python as unknown, "python"),
                    }}
                />
            }
        />
    </div>
);

export default CodeDiffBlock; 