export const MAX_TITLE = 100;
export const MAX_CODE = 15000;
export const MAX_TAGS = 100;
export const MAX_EXPLANATION = 3000;
export const MAX_BLOG_DESCRIPTION = 5000;
export const MAX_COMMENT_DESCRIPTION = 3000;

export const ALLOWED_TAGS = [
    // Languages
    "javascript", "python", "java", "c", "cpp", "go", "ruby", "swift", "rust", "php",

    // Coding Topics
    "arrays", "strings", "recursion", "sorting", "searching", "hashing", "dynamicprogramming",
    "greedy", "graph", "tree",
    // "divideandconquer", "bitmanipulation", "slidingwindow", "twopointers", "linkedlist",
    "heap", "math",

    // System Design & Concepts
    "api", "oop", "databases",

    // Blog Post Tags
    "solution", "discussion", "rant", "tutorial", "question", "explanation"
];
export const REDACTED = "<>Redacted<>";

export const AUTH = {
    USER: "USER",
    ADMIN: "ADMIN",
};

export const PRIVACY = {
    PUBLIC: "PUBLIC",
    PRIVATE: "PRIVATE",
};

export const POST = {
    BLOG: "BLOG",
    COMMENT: "COMMENT",
};

export const ORDER = {
    ASC: "ASC",
    DESC: "DESC",
    CONTROVERSIAL: "CONTROVERSIAL",
};

export const REPORT = {
    OPEN: "OPEN",
    RESOLVED: "RESOLVED",
}

export const SUPPORTED_LANGUAGES = {
    JAVASCRIPT: ["javascript", "js", "java script"],
    PYTHON: ["python", "py"],
    JAVA: ["java"],
    C_PLUS_PLUS: ["cpp", "c++", "c plus plus"],
    C: ["c"],
};