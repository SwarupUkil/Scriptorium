// GPT generated helper function to aid in sanitizing pagination values.
export function sanitizePagination(skip, take, DEFAULT_TAKE = 10, MAX_TAKE = 100) {
    let message = null;

    // Ensure `skip` is a non-negative integer; default to 0 if null or invalid
    const sanitizedSkip = Math.max(0, parseInt(skip, 10) || 0);
    if (isNaN(skip) || skip < 0) {
        message = message ? `${message}; ` : "";
        message += "`skip` must be a non-negative integer. Using default value of 0.";
    }

    // Ensure `take` is a positive integer within the allowed range
    let sanitizedTake = parseInt(take, 10) || DEFAULT_TAKE; // Default if null or invalid
    if (isNaN(take) || take < 1) {
        message = message ? `${message}; ` : "";
        message += "`take` must be a positive integer. Using default value.";
    } else if (sanitizedTake > MAX_TAKE) {
        sanitizedTake = MAX_TAKE;
        message = message ? `${message}; ` : "";
        message += `Requested 'take' exceeds max limit of ${MAX_TAKE}. Capping to max.`;
    }

    return { skip: sanitizedSkip, take: sanitizedTake, message };
}

export function paginationResponse(data, total, paginate, type) {

    if (Array.isArray(data) && data.length === 0) {
        return {
            data: data,
            message: `No ${type} found. Try loosening your search and check spelling.`,
            isEmpty: true,
            pagination: null
        };
    }

    // No next page if we've fetched all items.
    const nextSkip = paginate.skip + paginate.take < total ? paginate.skip + paginate.take : null;

    return {
        data: data, // Array of objects (e.g., comments or posts)
        message: paginate.message ? paginate.message : `Successfully retrieved ${type}.`,
        isEmpty: false,
        pagination: {
            total,
            nextSkip,
            currentSkip: paginate.skip,
            take: paginate.take,
        },
    };
}