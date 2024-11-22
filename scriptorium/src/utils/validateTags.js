// GPT produced tags helper.
import {ALLOWED_TAGS} from "./validateConstants";

export default function validateTagsCSV(tags) {

    // Check if tags is a string
    if (!tags || typeof tags !== "string") {
        return {
            isValid: false,
            validTags: [],
            invalidTags: [],
            message: ["Tags must be provided in CSV string format."],
        };
    }

    // Check if tags are in valid CSV notation
    const csvRegex = /^([a-zA-Z0-9\+]+)(,[a-zA-Z0-9\+]+)*$/;
    const isCsvFormat = csvRegex.test(tags);

    // Split and sanitize tags
    const tagArray = tags
        .split(",")
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0); // Remove empty tags

    // Identify valid and invalid tags
    const validTags = tagArray.filter(tag =>
        ALLOWED_TAGS.map(allowedTag => allowedTag.toLowerCase()).includes(tag)
    );

    const invalidTags = tagArray.filter(tag =>
        !ALLOWED_TAGS.map(allowedTag => allowedTag.toLowerCase()).includes(tag)
    );

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

    const normalizedValidTags = validTags.map(tag =>
        ALLOWED_TAGS.find(allowedTag => allowedTag.toLowerCase() === tag));

    return {
        isValid: isCsvFormat,
        validTags: normalizedValidTags,
        invalidTags,
        message,
    };
}