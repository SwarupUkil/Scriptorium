import React, {useEffect, useState} from "react";
import {getReports, ReportType} from "@/services/ReportService";
import Pagination from "@/components/Pagination";
import {calcTotalPages, handlePageChange} from "@/utils/frontend-helper/paginationHelper";
import {PaginationState} from "@/types/PaginationType";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import {useRouter} from "next/router";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";

const ReportsPage: React.FC = () => {

    const router = useRouter();
    const [data, setData] = useState<ReportType[]>([]);

    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 10,
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await tokenMiddleware(getReports, [{
                    skip: pagination.skip,
                    take: pagination.take,
                }]);

                if (response) {
                    const [reports, paginate] = response;
                    setData(reports); // Update the blog data
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
    }, [pagination.currentPage]);

    const handleCardClick = (report: ReportType) => {
        router.push(`/admin/reports/${report.postId}`); // Navigate to the dynamic blog page
    };

    return (
        <AdminAuthWrapper>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">Reports</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage and review reported posts.
                        </p>
                    </header>

                    {/* Reports as Cards */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-2">Reported Posts</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.map((report) => (
                                <div
                                    key={report.postId}
                                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
                                    onClick={() => handleCardClick(report)}
                                >
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            Post ID: {report.postId}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Number of Reports:{" "}
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {report.reportCount}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 mt-auto">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Click to review details
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

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

export default ReportsPage;