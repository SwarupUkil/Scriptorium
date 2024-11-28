import React from "react";
import Table from "@/components/Table/Table";
import {ReportType} from "@/services/ReportService";
import {BlogPost} from "@/types/PostType";

type ReportOfPostTableProps = {
    data: ReportType[];
    onRowClick: (row: ReportType) => void;
    flag?: ({postId}: {postId?: number}) => void;
    unflag?: ({postId}: {postId?: number}) => void;
    close?: ({rid, pid}: {rid?: number, pid?: number}) => void;
};

const ReportOfPostTable: React.FC<ReportOfPostTableProps> = ({data, onRowClick, flag, unflag, close}) => {
    const columns = [
        {
            header: "RID",
            accessor: (report: ReportType) => report.id,
            className: "w-1/12",
        },
        {
            header: "PostID",
            accessor: (report: ReportType) => report.postId,
            className: "w-1/12",
        },
        {
            header: "Username",
            accessor: (report: ReportType) => report.username,
            className: "w-1/6",
        },
        {
            header: "Explanation",
            accessor: (report: ReportType) => report.explanation,
            className: "w-3/6",
        },
        {
            header: "Date",
            accessor: (report: ReportType) => new Date(report.createdAt || Date.now()).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
            className: "w-1/6",
        },
        {
            header: "Actions",
            accessor: (report: ReportType) => (
                <div className="flex space-x-2">
                    {close && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering row click
                                close({ rid: report.id });
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Close
                        </button>
                    )}
                </div>
            ),
            className: "w-1/6 text-center",
        },
    ];

    return <Table data={data} columns={columns} onRowClick={onRowClick} />;
};

export default ReportOfPostTable;