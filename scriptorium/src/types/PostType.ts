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
};

export type Blog = BlogPost;

export type Comment = Post;

