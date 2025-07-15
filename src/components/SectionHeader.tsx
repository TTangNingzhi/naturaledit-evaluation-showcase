// SectionHeader component for section titles with optional icon

import React from "react";

type SectionHeaderProps = {
    icon?: React.ReactNode;
    children: React.ReactNode;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, children }) => (
    <div className="font-semibold text-base mb-2 text-gray-700 flex items-center gap-2">
        {icon} {children}
    </div>
);

export default SectionHeader;
