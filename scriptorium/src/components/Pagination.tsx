import React from "react";
import {PaginationProps} from "@/types/PaginationType";

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { currentPage, totalPages } = pagination;
    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1, pagination);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1, pagination);
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-4">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600
                           disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600
                           disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;