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
                return (
                    <button
                        key={item.id}
                        aria-label={`Subtask ${item.id}`}
                        title={item.id}
                        onClick={() => onSelect(idx)}
                        className={[
                            "w-4 h-4 rounded-full transition",
                            active ? "bg-blue-600 ring-2 ring-blue-300" : "bg-gray-300 hover:bg-gray-400",
                        ].join(" ")}
                    />
                );
            })}
        </div>
    );
};

export default SubtaskDots;
