export default function validateTagsCSV(tags) {
    // Check if tags is a string
    if (typeof tags !== 'string') {
        return false;
    }

    // Define a regular expression for a tight CSV format (no spaces allowed)
    const csvRegex = /^(\w+)(,\w+)*$/;

    // Test the tags string against the CSV format regex
    return csvRegex.test(tags);
}