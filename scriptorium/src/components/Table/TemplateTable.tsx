import React from "react";
import Table from "@/components/Table/Table";
import { Template } from "@/types/TemplateType";

type TemplateTableProps = {
    data: Template[];
    onRowClick: (row: Template) => void;
};

const TemplateTable: React.FC<TemplateTableProps> = ({ data, onRowClick }) => {
    const columns = [
        {
            header: "Title",
            accessor: (template: Template) => template.title,
            className: "w-2/6 truncate whitespace-nowrap overflow-hidden",
        },
        {
            header: "Explanation",
            accessor: (template: Template) => template.explanation,
            className: "w-2/6 truncate whitespace-nowrap overflow-hidden",
        },
        {
            header: "Tags",
            accessor: (template: Template) => template.tags,
            className: "w-3/6 truncate whitespace-nowrap overflow-hidden",
        },
    ];

    return <Table data={data} columns={columns} onRowClick={onRowClick} />;
};

export default TemplateTable;