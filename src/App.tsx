import React from "react";
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import BenchmarkResults from "./pages/BenchmarkResults";
import ExpertRatings from "./pages/ExpertRatings";

/**
 * Navigation component that handles the tab switching
 */
const Navigation: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <Link
                to="/benchmark"
                className={`px-3 py-1 rounded ${currentPath === "/benchmark" ? "bg-gray-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
                Benchmark
            </Link>
            <Link
                to="/ratings"
                className={`px-3 py-1 rounded ${currentPath === "/ratings" ? "bg-gray-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
                Ratings
            </Link>
        </div>
    );
};

/**
 * Top-level App
 * - Uses React Router with hash routing for GitHub Pages compatibility
 * - Provides navigation between two sections:
 *   1) Benchmark (route: /benchmark)
 *   2) Ratings (route: /ratings, default)
 *
 * This keeps the app organized as "NaturalEdit Evaluation Showcase".
 */
const App: React.FC = () => {
    return (
        <HashRouter>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="w-18/20 mx-auto">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="./naturaledit.svg" alt="NaturalEdit Logo" className="h-10 w-10" />
                            <div>
                                <span className="app-title mr-4">
                                    <span className="ne-highlight ne-yellow">Natural</span>
                                    <span className="ne-highlight ne-blue">Edit</span>
                                    <span className="ne-highlight ne-gray"> Evaluation Showcase</span>
                                </span>
                            </div>
                        </div>

                        <Navigation />
                    </div>

                    <div>
                        <Routes>
                            <Route path="/" element={<Navigate to="/ratings" replace />} />
                            <Route path="/benchmark" element={<BenchmarkResults />} />
                            <Route path="/ratings" element={<ExpertRatings />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </HashRouter>
    );
};

export default App;
