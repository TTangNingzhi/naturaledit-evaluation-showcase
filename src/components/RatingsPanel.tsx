import React from "react";

type RatingsPanelProps = {
    tasksCount: number;
};

const RatingsPanel: React.FC<RatingsPanelProps> = ({ tasksCount }) => {
    // 6 combos: low/medium/high × structured/unstructured
    const combos = 6;
    const versions = 2; // original + new
    const totalSummaries = tasksCount * combos * versions; // e.g., 6*6*2 = 72
    const totalSummaryDiffs = tasksCount * combos; // e.g., 6*6 = 36
    // Placeholder estimate for code segments; final counts depend on dataset
    const estimatedSegments = tasksCount * combos * versions * 5; // e.g., 6*6*2*5 = 360

    return (
        <div className="mt-4 bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">🏃 Technical Evaluation (Researcher Ratings)</h3>
                <div className="text-xs text-gray-500 font-mono">
                    Subtasks: {tasksCount} • Combos: 6 • Versions: 2
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Summary ratings</div>
                    <div className="text-xs text-gray-600 mb-2">
                        accuracy • completeness • conciseness • clarity
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        Total summaries: {totalSummaries} (tasks×6 combos×2 versions)
                    </div>
                    <div className="mt-2">
                        <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                            Open summary rating form (placeholder)
                        </button>
                    </div>
                </div>

                <div className="p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Code segment ratings</div>
                    <div className="text-xs text-gray-600 mb-2">
                        segmentation granularity • coverage • mapping accuracy
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        Estimated segments: {estimatedSegments} (tasks×6 combos×2 versions×~5)
                    </div>
                    <div className="mt-2">
                        <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                            Open mapping rating form (placeholder)
                        </button>
                    </div>
                </div>

                <div className="p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Summary diffs (old→new)</div>
                    <div className="text-xs text-gray-600 mb-2">
                        correspondence • salience • conciseness • completeness
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        Total summary diffs: {totalSummaryDiffs} (tasks×6 combos)
                    </div>
                    <div className="mt-2">
                        <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                            Open diff rating form (placeholder)
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <button
                    className="px-3 py-1.5 text-xs rounded bg-gray-800 text-white hover:bg-black"
                    onClick={() => {
                        const data = {
                            meta: {
                                tasksCount,
                                combos,
                                versions,
                                generatedAt: new Date().toISOString(),
                            },
                            ratings: {}, // placeholder
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "expert_ratings_placeholder.json";
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                >
                    Export ratings JSON (placeholder)
                </button>
                <span className="text-xs text-gray-500">Local persistence not yet implemented.</span>
            </div>
        </div>
    );
};

export default RatingsPanel;
