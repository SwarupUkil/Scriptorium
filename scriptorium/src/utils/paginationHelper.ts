/**
 * Helper function to sanitize pagination values.
 * Ensures `skip` and `take` values are valid integers and within allowed limits.
 *
 * @param skip - The number of items to skip.
 * @param take - The number of items to take.
 * @param DEFAULT_TAKE - Default value for `take` if not provided or invalid.
 * @param MAX_TAKE - Maximum allowable value for `take`.
 * @returns An object containing sanitized `skip`, `take`, and an optional message.
 */
export function sanitizePagination(
    skip: string | number | undefined,
    take: string | number | undefined,
    DEFAULT_TAKE = 10,
    MAX_TAKE = 100
): { skip: number; take: number; message: string | null } {
    let message: string | null = null;

    // Ensure `skip` is a non-negative integer; default to 0 if null or invalid
    const sanitizedSkip = Math.max(0, parseInt(skip as string, 10) || 0);
    if (isNaN(Number(skip)) || Number(skip) < 0) {
        message = message ? `${message}; ` : "";
        message += "`skip` must be a non-negative integer. Using default value of 0.";
    }

    // Ensure `take` is a positive integer within the allowed range
    let sanitizedTake = parseInt(take as string, 10) || DEFAULT_TAKE; // Default if null or invalid
    if (isNaN(Number(take)) || Number(take) < 1) {
        message = message ? `${message}; ` : "";
        message += "`take` must be a positive integer. Using default value.";
    } else if (sanitizedTake > MAX_TAKE) {
        sanitizedTake = MAX_TAKE;
        message = message ? `${message}; ` : "";
        message += `Requested 'take' exceeds max limit of ${MAX_TAKE}. Capping to max.`;
    }

    return { skip: sanitizedSkip, take: sanitizedTake, message };
}

/**
 * Helper function to generate a pagination response.
 * Formats the response data with metadata for pagination.
 *
 * @param data - The array of items to return.
 * @param total - The total number of items available.
 * @param paginate - Object containing `skip` and `take` values for pagination.
 * @param type - The type of items being returned (e.g., "posts" or "comments").
 * @returns A formatted pagination response.
 */
export function paginationResponse<T>(
    data: T[],
    total: number,
    paginate: { skip: number; take: number; message?: string | null },
    type: string
): {
    data: T[];
    message: string;
    isEmpty: boolean;
    pagination: {
        total: number;
        skip: number;
        prevSkip: number;
        take: number;
    };
} {
    if (Array.isArray(data) && data.length === 0) {
        return {
            data: data,
            message: `No ${type} found. Try loosening your search and check spelling.`,
            isEmpty: true,
            pagination: {
                total: 0,
                skip: 0,
                prevSkip: paginate.skip,
                take: paginate.take,
            },
        };
    }

    // No, next page if we've fetched all items.
    const nextSkip = paginate.skip + paginate.take < total ? paginate.skip + paginate.take : total;

    return {
        data: data, // Array of objects (e.g., comments or posts)
        message: paginate.message || `Successfully retrieved ${type}.`,
        isEmpty: false,
        pagination: {
            total,
            skip: nextSkip,
            prevSkip: paginate.skip,
            take: paginate.take,
        },
    };
}