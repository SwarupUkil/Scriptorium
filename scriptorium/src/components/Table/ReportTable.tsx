import React from "react";
import Table from "@/components/Table/Table";
import {ReportType} from "@/services/ReportService";

type ReportTableProps = {
    data: ReportType[];
    onRowClick: (row: ReportType) => void;
};

const ReportTable: React.FC<ReportTableProps> = ({data, onRowClick}) => {
    const columns = [
        {
            header: "PostId",
            accessor: (report: ReportType) => report.postId,
            className: "w-1/6",
        },
        {
            header: "Number of Reports",
            accessor: (report: ReportType) => report.reportCount,
            className: "w-2/6",
        },
    ];

    return <Table data={data} columns={columns} onRowClick={onRowClick} />;
};

export default ReportTable;