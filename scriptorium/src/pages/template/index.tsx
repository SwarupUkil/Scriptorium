import React, { useState } from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import Card from "@/components/Card/Card";
import TagDisplay from "@/components/TagDisplay";
import SearchBar from "@/components/SearchBar";
import { searchTemplates } from "@/services/TemplateService";
import { handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import { PaginationState } from "@/types/PaginationType";
import { Template } from "@/types/TemplateType";

export default function Templates() {
    const router = useRouter();
    const [data, setData] = useState<Template[]>([]);

    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 9, // Adjusted to display a grid with cards
        currentPage: 1,
        totalPages: 1,
    });

    const handleCardClick = async (templateId?: number) => {
        try {
            if (templateId) {
                await router.push(`/coding/${templateId}`);
            }
        } catch (error) {
            console.error("Routing failed:", error);

            // Redirect to a default route on failure
            await router.push("/template");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-around p-6">
            {/* Search Bar */}
            <div className="flex flex-col">
                <SearchBar
                    onApiCall={searchTemplates}
                    setData={setData}
                    pagination={pagination}
                    setPagination={setPagination}
                    isBlog={false} // Adjust this prop based on your implementation
                />
            </div>

            {/* Templates List as Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {data.map((template) => (
                    <Card
                        key={template.id}
                        title={template.title || ""}
                        content={
                            <div>
                                <TagDisplay value={template.tags || ""} />
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                    {template.explanation || "No explanation provided."}
                                </p>
                            </div>
                        }
                        actions={
                            <button
                                onClick={() => handleCardClick(template.id)}
                                className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                            >
                                View Template
                            </button>
                        }
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                pagination={pagination}
                onPageChange={handlePageChange(setPagination)}
            />
        </div>
    );
}