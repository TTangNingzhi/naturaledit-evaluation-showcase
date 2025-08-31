// SectionHeader component for section titles with optional icon

import React from "react";

type SectionHeaderProps = {
    icon?: React.ReactNode;
    children: React.ReactNode;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, children }) => (
    <div className="font-bold text-base mb-2 text-gray-600 flex items-center">
        {icon} {children}
    </div>
);

export default SectionHeader;
