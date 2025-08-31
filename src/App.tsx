import React, { useState } from "react";
import BenchmarkResults from "./pages/BenchmarkResults";
import ExpertRatings from "./pages/ExpertRatings";

/**
 * Top-level App
 * - Provides a simple switch between two sections:
 *   1) Benchmark Results (existing content moved)
 *   2) Expert Ratings (placeholder)
 *
 * This keeps the app organized as "NaturalEdit Evaluation Showcase".
 */
const App: React.FC = () => {
    const [section, setSection] = useState<"benchmark" | "expert">("benchmark");

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="w-17/20 mx-auto">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/naturaledit.svg" alt="NaturalEdit Logo" className="h-10 w-10" />
                        <div>
                            <span className="app-title mr-4">
                                <span className="ne-highlight ne-yellow">Natural</span>
                                <span className="ne-highlight ne-blue">Edit</span>
                                <span className="ne-highlight ne-gray"> Evaluation Showcase</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setSection("benchmark")}
                            className={`px-3 py-1 rounded ${section === "benchmark" ? "bg-gray-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            Benchmark Results
                        </button>
                        <button
                            onClick={() => setSection("expert")}
                            className={`px-3 py-1 rounded ${section === "expert" ? "bg-gray-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            Expert Ratings
                        </button>
                    </div>
                </div>

                <div>
                    {section === "benchmark" ? <BenchmarkResults /> : <ExpertRatings />}
                </div>
            </div>
        </div>
    );
};

export default App;
