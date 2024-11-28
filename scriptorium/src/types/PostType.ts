export type Post = {
    postId: number;
    username?: string;
    rating: number;
    content?: string;
    flagged: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type BlogPost = Post & {
    title: string;
    tags: string;
    templates?: number[];
};

export type Blog = BlogPost;

export type BlogContentProps = {
    blog: Blog;
    onLike?: () => void;
    onDislike?: () => void;
    onReply?: () => void;
};

export type NewBlogPost = {
    id?: number;
    title?: string;
    content?: string;
    tags?: string;
    templates?: number[];
}

export type Comment = Post;

export type CommentProps = {
    comment: Comment;
    onLike: (id: number) => void;
    onReply: (id: number) => void;
    depth: number; // To determine how much to shift for nesting
};

export type CommentListProps = {
    comments: Comment[];
    onLike: (id: number) => void;
    onReply: (id: number) => void;
    depth?: number; // For recursion tracking
};

