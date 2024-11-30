import React from "react";
import {ReportType} from "@/services/ReportService"; // Reuse the existing Card component

type ReportsCardProps = {
    report: ReportType;
    onClick: (report: ReportType) => void;
};

const ReportsCard: React.FC<ReportsCardProps> = ({ report, onClick }) => {
    return (
        <div
            onClick={() => onClick(report)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
        >
            {/* Post ID */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Post ID: {report.postId}
                </h3>

                {/* Number of Reports */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Number of Reports: {report.reportCount}
                </p>
            </div>

            {/* Instruction */}
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-4">
                Click to review details.
            </p>
        </div>
    );
};

export default ReportsCard;