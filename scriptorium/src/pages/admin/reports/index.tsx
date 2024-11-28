import React, {useEffect, useState} from "react";
import {getReports, ReportType} from "@/services/ReportService";
import Pagination from "@/components/Pagination";
import {calcTotalPages, handlePageChange} from "@/utils/frontend-helper/paginationHelper";
import {PaginationState} from "@/types/PaginationType";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import ReportTable from "@/components/Table/ReportTable";
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

    const handleRowClick = (report: ReportType) => {
        router.push(`reports/${report.postId}`); // Navigate to the dynamic blog page
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

                    {/* Placeholder for Top Reports */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-2">Top Reports</h2>

                        <div
                            className="bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-around p-6">
                            <div className="flex flex-col ">
                                <ReportTable data={data} onRowClick={handleRowClick}/>
                            </div>

                            <Pagination pagination={pagination}
                                        onPageChange={handlePageChange(setPagination)}/>

                            <div className="h-1"></div>
                        </div>
                    </section>

                </div>
            </div>
        </AdminAuthWrapper>
    );
};

export default ReportsPage;