import React, { useEffect, useState } from "react";
import { updateVote, getVote } from "@/services/PostService";
import { createReport } from "@/services/ReportService";
import Modal from "@/components/Modal";
import {tokenMiddleware} from "@/services/TokenMiddleware";
import {MAX_EXPLANATION} from "@/utils/validateConstants";
import toast from "react-hot-toast";

type InteractionBarProps = {
    parentId: number;
    initialRating: number;
};

const InteractionBar: React.FC<InteractionBarProps> = ({ parentId, initialRating }) => {
    const [rating, setRating] = useState(initialRating);
    const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
    const [initialUserVote, setInitialUserVote] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");

    useEffect(() => {
        if (initialUserVote) return;

        const fetchInitialVote = async () => {
            try {
                const initialVote = await tokenMiddleware(getVote, [parentId]);
                if (initialVote === 1) {
                    setUserVote("like");
                } else if (initialVote === -1) {
                    setUserVote("dislike");
                }
                setInitialUserVote(true);
            } catch (error) {
                console.error("Failed to fetch initial user vote:", error);
            }
        };

        fetchInitialVote();
    }, [initialUserVote, parentId]);

    const handleLike = async () => {
        let vote: number;
        if (userVote === "like") {
            setRating((prev) => prev - 1);
            setUserVote(null);
            vote = 0;
        } else {
            setRating((prev) => (userVote === "dislike" ? prev + 2 : prev + 1));
            setUserVote("like");
            vote = 1;
        }
        const success: boolean = await tokenMiddleware(updateVote, [parentId, vote]);
        if (!success) console.log("Failed to update vote.");
    };

    const handleDislike = async () => {
        let vote: number;
        if (userVote === "dislike") {
            setRating((prev) => prev + 1);
            setUserVote(null);
            vote = 0;
        } else {
            setRating((prev) => (userVote === "like" ? prev - 2 : prev - 1));
            setUserVote("dislike");
            vote = -1;
        }
        const success: boolean = await tokenMiddleware(updateVote, [parentId, vote]);
        if (!success) console.log("Failed to update vote.");
    };

    const handleReportSubmit = async () => {
        if (!reportReason.trim()) {
            console.log("Please provide a reason for reporting.");
            return;
        }

        try {
            const success = await tokenMiddleware(createReport, [{ postId: parentId, explanation: reportReason }]);
            if (success) {
                toast.success("Reported!");
                console.log("Report submitted successfully.");
                setReportReason("");
                setIsModalOpen(false);
            } else {
                toast.error("Failed to submit the report.");
                console.log("Failed to submit the report.");
            }
        } catch (error) {
            toast.error("Failed to submit the report.");
            console.error("Failed to create report:", error);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center mt-1">
                {/* Like Button */}
                <button
                    onClick={handleLike}
                    aria-label="Like"
                    className={`px-2 py-0 rounded focus:outline-none ${
                        userVote === "like" ? "text-green-600" : "text-gray-500"
                    } hover:text-green-600`}
                >
                    ▲
                </button>

                {/* Rating */}
                <span className="text-gray-700 dark:text-gray-300 text-sm mt-0">{rating}</span>

                {/* Dislike Button */}
                <button
                    onClick={handleDislike}
                    aria-label="Dislike"
                    className={`px-2 py-0 rounded focus:outline-none ${
                        userVote === "dislike" ? "text-red-600" : "text-gray-500"
                    } hover:text-red-600 mt-0.5`}
                >
                    ▼
                </button>

                {/* Report Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Report"
                    className="px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none mt-1 "
                >
                    🚩
                </button>
            </div>

            {/* Modal for Reporting */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    title="Report Post"
                    onClose={() => setIsModalOpen(false)}
                >
                    <textarea
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
                        rows={4}
                        placeholder="Please provide a reason for reporting this post..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        maxLength={MAX_EXPLANATION}
                    />
                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReportSubmit}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Submit Report
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default InteractionBar;