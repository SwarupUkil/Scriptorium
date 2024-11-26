/**
 * Helper function to make a GET API request and handle responses.
 *
 * @param url - The API endpoint to fetch data from.
 * @returns A tuple containing the response data and pagination information.
 * @throws An error if the response is not OK or if there's an issue with the request.
 */
export async function fetchWithPagination<T>(url: string): Promise<[T[], any]> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (data.isEmpty) {
            return [[], data.pagination];
        }

        return [data.data, data.pagination]; // Return the response data and pagination info
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Re-throw the error for caller to handle
    }
}

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

/**
 * Parses a CSV-formatted string and returns an array of cleaned tags.
 *
 * @param csv - A CSV string of tags.
 * @returns An array of lowercase, trimmed, alphanumeric tags.
 */
export function parseCSVToTags(csv: string): string[] {
    return csv
        .split(",")                                // Split the string by commas
        .map(tag => tag.trim().toLowerCase())      // Trim and convert to lowercase
        .map(tag => tag.replace(/[^a-z0-9]/gi, '')) // Remove non-alphanumeric characters
        .filter(tag => tag.length > 0);           // Remove empty strings
}