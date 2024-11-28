import React from "react";
import Table from "@/components/Table/Table";
import {BlogPost} from "@/types/PostType";

type BlogTableProps = {
    data: BlogPost[];
    onRowClick: (row: BlogPost) => void;
    onDelete?: (blogId: number) => void;
};

const BlogTable: React.FC<BlogTableProps> = ({data, onRowClick, onDelete}) => {
    const columns = [
        {
            header: "Rating",
            accessor: (blog: BlogPost) => blog.rating,
            className: "w-1/6",
        },
        {
            header: "Title",
            accessor: (blog: BlogPost) => blog.title,
            className: "w-2/6",
        },
        {
            header: "Tags",
            accessor: (blog: BlogPost) => blog.tags,
            className: "w-3/6",
        },
    ];

    // Add a "Delete" column if onDelete is provided
    if (onDelete) {
        columns.push({
            header: "Actions",
            accessor: (blog: BlogPost) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering row click
                        onDelete(blog.postId);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Delete
                </button>
            ),
            className: "w-1/6 text-center",
        });
    }

    return <Table data={data} columns={columns} onRowClick={onRowClick} />;
};

export default BlogTable;