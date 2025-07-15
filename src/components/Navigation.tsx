// Navigation component for previous/next navigation with icons
import React from "react";

type NavigationProps = {
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    onNavigate?: (index: number) => void;
};

const Navigation: React.FC<NavigationProps> = ({ current, total, onPrev, onNext, onNavigate }) => (
    // Navigation bar with icon buttons for previous/next and manual navigation input
    <div className="flex items-center gap-2 navigation-bar">
        <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow transition hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onPrev}
            disabled={current === 0}
            aria-label="Previous"
        >
            {/* Left arrow SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M13 16l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
        {onNavigate ? (
            <>
                <label className="flex items-center gap-1 text-sm text-gray-500 font-mono select-none">
                    <input
                        type="number"
                        min={1}
                        max={total}
                        value={current + 1}
                        onChange={e => {
                            let val = Number(e.target.value);
                            if (isNaN(val)) return;
                            val = Math.max(1, Math.min(total, val));
                            onNavigate(val - 1);
                        }}
                        className="w-12 px-1 py-0.5 border border-gray-300 rounded text-sm font-mono text-center no-spinner"
                        style={{ width: 40 }}
                        aria-label="Go to sample"
                    />
                    <span>/ {total}</span>
                </label>
            </>
        ) : (
            <span className="text-gray-500 text-xs font-mono min-w-[48px] text-center select-none">
                {current + 1} / {total}
            </span>
        )}
        <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow transition hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onNext}
            disabled={current === total - 1}
            aria-label="Next"
        >
            {/* Right arrow SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    </div>
);

export default Navigation;
