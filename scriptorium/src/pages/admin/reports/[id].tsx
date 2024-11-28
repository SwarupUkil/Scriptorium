import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getReportsByPost, ReportType, closeReport, flagReportForAdmin } from "@/services/ReportService";
import { tokenMiddleware } from "@/services/TokenMiddleware";
import Pagination from "@/components/Pagination";
import { PaginationState } from "@/types/PaginationType";
import ReportCard from "@/components/Card/ReportCard";
import { calcTotalPages, handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";

const ReportsOfPost: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [reports, setReports] = useState<ReportType[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 9,
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        if (!id) return;

        const fetchReports = async () => {
            try {
                const response = await tokenMiddleware(getReportsByPost, [
                    { id: Number(id), skip: pagination.skip, take: pagination.take },
                ]);

                if (response) {
                    const [fetchedReports, paginate] = response;
                    setReports(fetchedReports);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: Math.max(calcTotalPages(paginate.take, paginate.total), 1),
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
        };

        fetchReports();
    }, [pagination.currentPage, id]);

    const handleFlag = async () => {
        if (!id) return;
        try {
            const success = await tokenMiddleware(flagReportForAdmin, [{ id: Number(id), flag: true }]);
            if (success) {
                console.log(`Successfully flagged post ${id}`);
            }
        } catch (error) {
            console.error(`Failed to flag post ${id}:`, error);
        }
    };

    const handleUnflag = async () => {
        if (!id) return;
        try {
            const success = await tokenMiddleware(flagReportForAdmin, [{ id: Number(id), flag: false }]);
            if (success) {
                console.log(`Successfully unflagged post ${id}`);
            }
        } catch (error) {
            console.error(`Failed to unflag post ${id}:`, error);
        }
    };

    const handleCloseAll = async () => {
        if (!id) return;
        try {
            const success = await tokenMiddleware(closeReport, [{ pid: Number(id) }]);
            if (success) {
                setReports([]);
                console.log(`Successfully closed all reports for post ${id}`);
            }
        } catch (error) {
            console.error(`Failed to close all reports for post ${id}:`, error);
        }
    };

    const handleClose = async (rid?: number) => {
        try {
            const success = await tokenMiddleware(closeReport, [{ id: rid }]);
            if (success) {
                setReports((prev) => prev.filter((report) => report.id !== rid));
                console.log(`Successfully closed report ${rid}`);
            }
        } catch (error) {
            console.error(`Failed to close report ${rid}:`, error);
        }
    };

    return (
        <AdminAuthWrapper>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Reports for Post ID: {id}</h1>

                    {/* Action Buttons Container */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleFlag}
                                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                            >
                                Flag Post
                            </button>
                            <button
                                onClick={handleUnflag}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            >
                                Unflag Post
                            </button>
                            <button
                                onClick={handleCloseAll}
                                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                            >
                                Close All Reports
                            </button>
                        </div>
                    </div>

                    {/* Reports as Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <ReportCard key={report.id} report={report} onClose={handleClose}/>
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        pagination={pagination}
                        onPageChange={handlePageChange(setPagination)}
                    />
                </div>
            </div>
        </AdminAuthWrapper>
    );
};

export default ReportsOfPost;