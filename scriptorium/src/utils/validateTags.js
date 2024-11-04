// GPT produced tags helper.
export default function validateTagsCSV(tags) {
    // Check if tags is a string
    if (typeof tags !== 'string') {
        return false;
    }

    // Define a regular expression for a strict CSV format (no spaces allowed)
    const csvRegex = /^([a-zA-Z0-9\+]+)(,[a-zA-Z0-9\+]+)*$/;

    // Test the tags string against the CSV format regex
    return csvRegex.test(tags);
}