import React from "react";
import Table from "@/components/Table/Table";
import {BlogPost} from "@/types/PostType";

type BlogTableProps = {
    data: BlogPost[];
    onRowClick: (row: BlogPost) => void;
};

const BlogTable: React.FC<BlogTableProps> = ({data, onRowClick}) => {
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

    return <Table data={data} columns={columns} onRowClick={onRowClick} />;
};

export default BlogTable;