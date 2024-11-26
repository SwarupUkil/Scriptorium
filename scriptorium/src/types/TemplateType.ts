export type Template = {
    id: number; // Unique identifier for the template
    code?: string; // The code snippet
    language?: string; // Programming language of the code
    title?: string; // Title of the template
    explanation?: string; // Description or explanation of the code
    tags?: string[] | null; // List of tags associated with the template (nullable)
    privacy?: 'PUBLIC' | 'PRIVATE'; // Privacy level of the template
    forkedFrom?: number | null; // ID of the template it was forked from (nullable)
};