import {constructQueryParams} from "@/utils/frontend-helper/apiHelper";
import {SearchBlogsParams} from "@/types/SearchType";
import {Blog, BlogPost, Comment, NewBlogPost} from "@/types/PostType";
import {PaginationAPIResponse} from "@/types/PaginationType";

export const searchBlogs = async ({
  skip,
  take,
  title,
  content,
  tags,
  templates,
}: SearchBlogsParams): Promise<BlogPost[]> => {

    const url = '/api/posts/blogs' + constructQueryParams({
        skip,
        take,
        title,
        content,
        tags,
        templates,
    });

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

        return [data.data, data.pagination]; // Return the actual blog posts
    } catch (error) {
        console.error("Error in searchBlogs:", error);
        throw new Error("Error fetching blogs");
    }
};


export const getReplies = async ({skip, take, id}: {
    skip?: number,
    take?: number,
    id: number,
}): Promise<[Comment[], PaginationAPIResponse] | null> => {

    const url = '/api/posts/shared/replies' + constructQueryParams({
        skip,
        take,
        id,
    });

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.isEmpty) {
            return [[], data.pagination];
        }

        return [data.data, data.pagination]; // Return the actual blog posts
    } catch (error) {
        console.error("Error in searchBlogs:", error);
        throw new Error("Error fetching blogs");
    }
};


/////
export const getBlog = async (id: number): Promise<Blog | null> => {
    const url = '/api/posts/blogs/' + id.toString();

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Couldn't retrieve a blog.
        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error in getBlog:", error);
        throw new Error("Error fetching blog");
    }
};

export const getAllBlogsByUser = async ({skip, take}: {skip?: number, take?: number})
: Promise<[Blog[], PaginationAPIResponse] | null> => {
    const url = '/api/posts/blogs/users/all' + constructQueryParams({skip, take});
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    if (!accessToken) {
        console.error("Authorization token not found.");
        return null;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
        });

        // Couldn't retrieve a blog.
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.isEmpty) {
            return [[], data.pagination];
        }

        return [data.data, data.pagination];
    } catch (error) {
        console.error("Error in getAllBlogsByUser:", error);
        throw new Error("Error fetching blogs");
    }
};

export const createBlog = async ({
     title,
     content,
     tags,
     templates,
 }: NewBlogPost): Promise<BlogPost | null> => {
    const url = '/api/posts/blogs/users/create';
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    if (!accessToken) {
        console.error("Authorization token not found.");
        return null;
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
            body: JSON.stringify({ title, content, tags, templates }), // Send comment data in the body
        });

        return await response.json(); // Return newly created postId.
    } catch (error) {
        console.error("Error creating comment:", error);
        return null;
    }
};

export const updateBlog = async ({
                                     id,
                                     title,
                                     content,
                                     tags,
                                     templates,
                                 }: NewBlogPost): Promise<boolean> => {
    const url = '/api/posts/blogs/users/edit';
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        console.error("Authorization token not found.");
        return false;
    }

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ id, title, content, tags, templates }),
        });

        return response.ok;
    } catch (error) {
        console.error("Error creating comment:", error);
        return false;
    }
};

export const deletedBlog = async ({id}: NewBlogPost): Promise<boolean> => {
    const url = '/api/posts/blogs/users/edit';
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        console.error("Authorization token not found.");
        return false;
    }

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ id }),
        });

        return response.ok;
    } catch (error) {
        console.error("Error creating comment:", error);
        return false;
    }
};


//
export const getComment = async (id: number): Promise<Comment | null> => {
    const url = `/api/posts/comments/${id}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Couldn't retrieve a blog.
        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error in getComment:", error);
        throw new Error("Error fetching comment");
    }
};

export const createComment = async (id: number, description: string): Promise<Comment | null> => {
    const url = "/api/posts/comments/create";
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    if (!accessToken) {
        console.error("Authorization token not found.");
        return null;
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
            body: JSON.stringify({ id, description }), // Send comment data in the body
        });

        if (!response.ok) {
            console.error(`Failed to create comment: ${response.statusText}`);
            return null;
        }

        return await response.json(); // Return the created comment
    } catch (error) {
        console.error("Error creating comment:", error);
        return null;
    }
};

export const updateComment = async (id: number, description: string): Promise<boolean> => {
    const url = "/api/posts/comments/edit";
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    if (!accessToken) {
        console.error("Authorization token not found.");
        return false;
    }

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
            body: JSON.stringify({ id, description }), // Send comment data in the body
        });

        return response.ok;
    } catch (error) {
        console.error("Error creating comment:", error);
        return false;
    }
};

///
export const updateVote = async (id: number, rating: number): Promise<boolean> => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.error("No auth token found. User may not be logged in.");
        return false;
    }

    const url = `/api/posts/shared/vote?id=${id}&rating=${rating}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include the JWT token in the Authorization header
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error in updateVote:", error);
        return false;
    }
};

export const getVote = async (id: number): Promise<number> => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.error("No auth token found. User may not be logged in.");
        return 0;
    }

    const url = `/api/posts/shared/vote?id=${id}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include the JWT token in the Authorization header
            },
        });

        if (!response.ok) {
            return 0; // Presume user did not vote.
        }

        const data = await response.json();
        return data.vote;
    } catch (error) {
        console.error("Error in getVote:", error);
        return 0;
    }
};