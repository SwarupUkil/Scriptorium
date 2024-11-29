import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import Card from "@/components/Card/Card";
import Modal from "@/components/Modal"; // Import the modal component
import TagDisplay from "@/components/TagDisplay";
import { calcTotalPages, handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import { PaginationState } from "@/types/PaginationType";
import { createTemplate, getAllTemplatesByUser, deleteTemplate } from "@/services/TemplateService";
import { tokenMiddleware } from "@/services/TokenMiddleware";
import { PRIVACY, SUPPORTED_LANGUAGES } from "@/utils/validateConstants";

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
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

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

    const handleCreateNew = async () => {
        try {
            const newTemplate = {
                code: "// Code here",
                language: SUPPORTED_LANGUAGES.JAVASCRIPT[0],
                title: "Untitled Template",
                explanation: "Provide details about this template...",
                tags: "",
                privacy: PRIVACY.PRIVATE,
            };

            const response = await tokenMiddleware(createTemplate, [newTemplate]);

            if (response) {
                await router.push(`/coding/${response.id}`);
            } else {
                console.error("Failed to create new template.");
            }
        } catch (error) {
            console.error("Error in handleCreateNew:", error);
        }
    };

    const handleEditTemplate = (templateId: number) => {
        router.push(`/coding/${templateId}`);
    };

    const handleOpenDeleteModal = (templateId: number) => {
        setTemplateToDelete(templateId);
        setModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;

        try {
            const success = await tokenMiddleware(deleteTemplate, [{ id: templateToDelete }]);
            if (success) {
                setTemplates((prev) =>
                    prev.filter((template) => template.id !== templateToDelete)
                );
                console.log("Template deleted successfully.");
            } else {
                console.error("Failed to delete template.");
            }
        } catch (error) {
            console.error("Error deleting template:", error);
        } finally {
            setModalOpen(false);
            setTemplateToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-between p-6">
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
                                <TagDisplay value={template.tags} />
                            </div>
                        }
                        actions={
                            <div className="flex items-center w-full">
                                {/* Edit Button - 75% */}
                                <button
                                    onClick={() => handleEditTemplate(template.id)}
                                    className="flex-grow-3 w-3/4 px-4 py-2 bg-indigo-500 text-white rounded-l-md hover:bg-indigo-600 mr-1"
                                >
                                    Edit
                                </button>

                                {/* Delete Button - 25% */}
                                <button
                                    onClick={() => handleOpenDeleteModal(template.id)}
                                    className="flex-grow-1 w-1/4 px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        }
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange(setPagination)} />

            <div className={"h-1"}></div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="Delete Template"
            >
                <p>Are you sure you want to delete this template?</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
}