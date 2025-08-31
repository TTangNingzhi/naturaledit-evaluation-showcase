import React from "react";

/**
 * ExpertRatings page (placeholder)
 * - Placeholder page for future expert rating UI
 */
const ExpertRatings: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-2">
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="mb-4 flex flex-col gap-2 w-full">
                    <div className="mb-2 flex flex-row items-end justify-between w-full gap-4">
                        <div className="flex flex-row items-end">
                            <span className="text-2xl font-semibold text-gray-600">⭐ Expert Ratings</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-sm text-gray-700 font-mono">
                    This section is reserved for Expert Ratings. The UI is a placeholder for now.
                    Implement rating forms, reviewer lists, and aggregated metrics here.
                </div>
            </div>
        </div>
    );
};

export default ExpertRatings;
