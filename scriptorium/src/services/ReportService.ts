import {ErrorResponse} from "@/types/UserTypes";
import {PaginationAPIResponse} from "@/types/PaginationType";
import {constructQueryParams} from "@/utils/frontend-helper/apiHelper";

export type ReportType = {
    id?: number;
    postId?: number;
    username?: string;
    explanation?: string;
    createdAt?: Date;
    reportCount?: number;
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
                                 }: { skip: number; take: number }): Promise<[ReportType[], PaginationAPIResponse]| Error> => {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/reports/admin` + constructQueryParams({skip, take}), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include the JWT token
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
        const response = await fetch(`${API_BASE_URL}/posts/reports`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Include the JWT token
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
    {id, skip, take }: {id: number, skip: number; take: number }
): Promise<[ReportType[], PaginationAPIResponse]| Error> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/posts/reports/admin` + constructQueryParams({id, skip, take}),
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            }
        );

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to fetch reports');
        }

        return [data.data, data.pagination];
    } catch (error) {
        console.error("Error fetching reports by post:", error);
        return new Error('Failed to fetch reports');
    }
};


export const flagReportForAdmin = async ({id, flag,}: {
    id?: number;
    flag?: boolean;
}): Promise<boolean | Error> => {
    const url = `/api/posts/reports/admin` + constructQueryParams({id, flag});
    const authToken = localStorage.getItem("accessToken");

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to flag reports');
        }

        return response.ok;
    } catch (error) {
        console.error("Error flagging report for admin:", error);
        return new Error('Failed to flag reports');
    }
};

export const closeReport = async ({ id, pid,}: {
    id?: number;
    pid?: number;
}): Promise<boolean | Error> => {
    const url = `/api/posts/reports/close`  + constructQueryParams({id, pid});
    const authToken = localStorage.getItem("accessToken");

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to close reports');
        }

        return response.ok;
    } catch (error) {
        console.error("Error closing report:", error);
        return new Error('Failed to close reports');
    }
};