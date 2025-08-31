import React from "react";

type SubtaskDotsProps = {
    items: { id: string }[];
    currentIndex: number;
    onSelect: (index: number) => void;
};

const SubtaskDots: React.FC<SubtaskDotsProps> = ({ items, currentIndex, onSelect }) => {
    return (
        <div className="flex items-center gap-2">
            {items.map((item, idx) => {
                const active = idx === currentIndex;
                const label = item.id.match(/[A-C]$/)?.[0] ?? item.id;
                return (
                    <button
                        key={item.id}
                        aria-label={`Subtask ${item.id}`}
                        title={item.id}
                        onClick={() => onSelect(idx)}
                        className={[
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition",
                            active ? "bg-blue-600 text-white ring-2 ring-blue-300" : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                        ].join(" ")}
                    >
                        <span className="select-none pointer-events-none">{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default SubtaskDots;
