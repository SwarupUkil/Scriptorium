export type PaginationState = {
    skip: number;
    take: number;
    currentPage: number;
    totalPages: number;
};

export type OnPageChange = (
    setPaginate: (newState: PaginationState) => void
) => (newPage: number, currentState: PaginationState) => void;

export interface PaginationProps {
    pagination: PaginationState;
    onPageChange: (currentPage: number, newState: PaginationState) => void;
}