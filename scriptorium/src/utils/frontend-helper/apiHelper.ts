/**
 * Constructs a query parameter string from an object of parameters.
 *
 * @param params - An object containing key-value pairs to be converted to query parameters.
 * @returns A properly encoded query parameter string.
 */
export function constructQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                // Append array values as multiple key-value pairs
                value.forEach((item) => {
                    searchParams.append(key, String(item));
                });
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Parses the tags array and returns a CSV-formatted string.
 *
 * @param tags - An array of tags to process.
 * @returns A CSV string with lowercase, trimmed tags.
 */
export function parseTagsToCSV(tags: string[]): string {
    return tags
        .map(tag => tag.trim().toLowerCase())       // Trim and convert to lowercase
        .map(tag => tag.replace(/[^a-z0-9]/gi, '')) // Remove non-alphanumeric characters
        .filter(tag => tag.length > 0)             // Remove empty strings
        .join(",");                                // Join as CSV
}