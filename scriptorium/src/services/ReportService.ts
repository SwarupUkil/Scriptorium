import {ErrorResponse} from "@/types/UserTypes";
import {PaginationAPIResponse} from "@/types/PaginationType";
import {constructQueryParams} from "@/utils/frontend-helper/apiHelper";

export type Report = {
    postId?: number;
    username?: string;
    explanation?: string;
    createdAt?: Date;
    reportedCount?: number;
}

const API_BASE_URL = "/api"; // Adjust this base URL as needed

/**
 * Fetch reports for posts with pagination.
 *
 * @param params - An object containing `skip` and `take` for pagination.
 * @returns A promise resolving to a list of reported posts.
 */
export const getReports = async ({
                                     skip,
                                     take,
                                 }: { skip: number; take: number }): Promise<[Report[], PaginationAPIResponse]| Error> => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/reports` + constructQueryParams({skip, take}), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include the JWT token
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to fetch reports');
        }

        return [data.data, data.pagination];
    } catch (error) {
        console.error("Error fetching reports:", error);
        return new Error('Failed to fetch reports');
    }
};

/**
 * Create a new report for a post.
 *
 * @param postId - The ID of the post to report.
 * @param explanation - The explanation for the report.
 * @returns A promise resolving to a success message or null on failure.
 */
export const createReport = async ({
                                       postId,
                                       explanation,
                                   }: {
    postId: number;
    explanation: string;
}): Promise<boolean | Error> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include the JWT token
            },
            body: JSON.stringify({ id: postId, explanation }),
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to create report');
        }

        return response.ok;
    } catch (error) {
        console.error("Error creating report:", error);
        return new Error('Failed to create report');
    }
};

/**
 * Fetch a single post's reports based on the post ID.
 *
 * @param postId - The ID of the post.
 * @returns A promise resolving to a list of `Report` objects.
 */
export const getReportsByPost = async (
    {postId, skip, take }: {postId: number, skip: number; take: number }
): Promise<[Report[], PaginationAPIResponse]| Error> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/reports` + constructQueryParams({postId, skip, take}),
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            }
        );

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to fetch reports');
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching reports by post:", error);
        return new Error('Failed to fetch reports');
    }
};