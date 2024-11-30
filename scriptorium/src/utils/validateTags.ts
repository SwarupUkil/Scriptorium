// Helper to normalize and deduplicate tags
function normalizeAndDeduplicateTags(tags) {
    const uniqueTags = new Set(
        tags.map(tag => tag.trim().toLowerCase()) // Normalize to lowercase
    );
    return Array.from(uniqueTags); // Convert back to an array
}

// Main validation function
import { ALLOWED_TAGS } from "./validateConstants";

export default function validateTagsCSV(tags) {
    // Check if tags is a string
    if (!tags || typeof tags !== "string") {
        return {
            isValid: false,
            validTags: [],
            invalidTags: [],
            message: "Tags must be provided in CSV string format.",
        };
    }

    // Check if tags are in valid CSV notation
    const csvRegex = /^([a-zA-Z0-9\+]+)(,[a-zA-Z0-9\+]+)*$/;
    const isCsvFormat = csvRegex.test(tags);

    // Split, normalize, and deduplicate tags
    const rawTags = tags.split(",").filter(tag => tag.trim().length > 0); // Remove empty tags
    const uniqueTags = normalizeAndDeduplicateTags(rawTags);

    // Identify valid and invalid tags
    const allowedTagsLower = ALLOWED_TAGS.map(tag => tag.toLowerCase());
    const validTags = uniqueTags.filter(tag => allowedTagsLower.includes(tag));
    const invalidTags = uniqueTags.filter(tag => !allowedTagsLower.includes(tag));

    // Build warnings
    let message = "";
    if (!isCsvFormat) {
        message = "Tags must be given following CSV notation (e.g., 'javascript,python').";
    }
    if (invalidTags.length > 0) {
        message += ` The following tags are not valid: ${invalidTags.join(", ")}.`;
    }

    // Default to a generic success message if no issues
    if (!message) {
        message = "Tags are valid.";
    }

    // Normalize valid tags to match ALLOWED_TAGS casing
    const normalizedValidTags = validTags.map(tag =>
        ALLOWED_TAGS.find(allowedTag => allowedTag.toLowerCase() === tag)
    );

    return {
        isValid: isCsvFormat,
        validTags: normalizedValidTags,
        invalidTags,
        message,
    };
}