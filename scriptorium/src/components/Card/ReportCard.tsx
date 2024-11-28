import React from "react";
import Card from "@/components/Card/Card";
import {ReportType} from "@/services/ReportService";

type ReportCardProps = {
    report: ReportType; // Individual report data
    onClose: (rid?: number) => void; // Callback for the "Close" action
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onClose }) => {
    return (
        <Card
            title={`Report ID: ${report.id}`}
            subtitle={`${new Date(report.createdAt || Date.now()).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })}`}
            content={
                <div>
                    <p className="text-sm">
                        <strong>User:</strong> {report.username}
                    </p>
                    <p className="mt-2 text-sm">
                        <strong>Explanation:</strong> {report.explanation}
                    </p>
                </div>
            }
            actions={
                <button
                    onClick={() => onClose(report.id)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    Close Report
                </button>
            }
        />
    );
};

export default ReportCard;