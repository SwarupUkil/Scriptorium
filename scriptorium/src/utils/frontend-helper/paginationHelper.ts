import {OnPageChange, PaginationState} from "@/types/PaginationType";

/**
 * Handles pagination logic by updating skip and take values.
 *
 * @param setPaginate - A function to update the state.
 */
export const handlePageChange: OnPageChange = setPaginate => {

    return (newPage: number, currentState: PaginationState) => {
        const {take, totalPages} = currentState;

        // Ensure the new page is within valid bounds
        if (newPage < 1 || newPage > totalPages) {
            console.warn("Invalid page number");
        }

        // Calculate the new skip value
        const newSkip = (newPage - 1) * take;
        setPaginate({
            ...currentState,
            skip: newSkip,
            currentPage: newPage,
        });

    };
};

export const calcTotalPages = (take: number, totalItems: number) => Math.ceil(totalItems / take);