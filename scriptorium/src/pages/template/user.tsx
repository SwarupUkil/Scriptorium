import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import Card from "@/components/Card/Card";
import TagDisplay from "@/components/TagDisplay"; // Import the TagDisplay component
import { calcTotalPages, handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import { PaginationState } from "@/types/PaginationType";
import { getAllTemplatesByUser } from "@/services/TemplateService";
import { tokenMiddleware } from "@/services/TokenMiddleware";

type TemplateType = {
    id: number;
    title: string;
    tags: string;
};

export default function TemplateManagement() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateType[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 9,
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await tokenMiddleware(getAllTemplatesByUser, [
                    {
                        skip: pagination.skip,
                        take: pagination.take,
                    },
                ]);

                if (response) {
                    const [fetchedTemplates, paginate] = response;
                    setTemplates(fetchedTemplates);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: Math.max(calcTotalPages(paginate.take, paginate.total), 1),
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            }
        };

        fetchTemplates();
    }, [pagination.currentPage]);

    const handleCreateNew = () => {
        router.push(`/templates/create`);
    };

    const handleEditTemplate = (templateId: number) => {
        router.push(`/templates/edit/${templateId}`);
    };

    return (
        <div className="bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-between p-6">
            {/* Create Template Button */}
            <div className="mb-4 flex justify-center">
                <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring focus:ring-blue-300"
                >
                    Create New Template
                </button>
            </div>

            {/* Templates List as Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <Card
                        key={template.id}
                        title={template.title}
                        content={
                            <div>
                                {/*<h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>*/}
                                <TagDisplay value={template.tags} /> {/* Use TagDisplay here */}
                            </div>
                        }
                        actions={
                            <button
                                onClick={() => handleEditTemplate(template.id)}
                                className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                            >
                                Edit Template
                            </button>
                        }
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange(setPagination)} />
        </div>
    );
}