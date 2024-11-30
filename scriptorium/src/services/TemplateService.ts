import {fetchWithPagination, constructQueryParams, parseTagsToCSV} from "@/utils/frontend-helper/apiHelper";
import {SearchTemplatesParams} from "@/types/SearchType";
import {Template} from "@/types/TemplateType";
import {ErrorResponse} from "@/types/UserTypes";
import {PaginationAPIResponse} from "@/types/PaginationType";

export const searchTemplates = async ({
                                      skip,
                                      take,
                                      title,
                                      content,
                                      tags,
                                  }: SearchTemplatesParams): Promise<Template[]> => {

    const url = '/api/templates' + constructQueryParams({
        skip,
        take,
        title,
        content,
        tags,
    });

    try {
        return fetchWithPagination(url);
    } catch (error) {
        console.error("Error in searchTemplates:", error);
        throw new Error("Error fetching templates");
    }
};

export const getTemplate = async (id: number): Promise<Template | null> => {
    const url = '/api/templates/' + id.toString();

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
        return null;
    }
};

export const getAllTemplatesByUser = async ({skip, take}: {skip?: number, take?: number})
    : Promise<[Template[], PaginationAPIResponse] | Error> => {
    const url = '/api/templates/users/all' + constructQueryParams({skip, take});
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to refresh token');
        }

        if (data.isEmpty) {
            return [[], data.pagination];
        }

        return [data.data, data.pagination];
    } catch (error) {
        console.error("Error in getAllTemplatesByUser:", error);
        return error as Error;
    }
};

export const getSpecificTemplateByUser = async (id: number)
    : Promise<[Template, PaginationAPIResponse] | Error> => {
    const url = '/api/templates/users/' + id.toString();
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to refresh token');
        }

        return data;
    } catch (error) {
        console.error("Error in getAllTemplatesByUser:", error);
        return error as Error;
    }
};

export const createTemplate = async ({
    code,
    language,
    title,
    explanation,
    tags,
    privacy
                                 }: Template): Promise<Template | Error> => {
    const url = '/api/templates/users/create';
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage
    const parsedTags = parseTagsToCSV(tags as string[] || []);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ code, language, title, explanation, tags: parsedTags, privacy }),
        });

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to refresh token');
        }

        return data; // Return newly created templateId.
    } catch (error) {
        console.error("Error creating template:", error);
        return error as Error;
    }
};

export const forkTemplate = async ({ id }: Template): Promise<Template | Error> => {
    const url = '/api/templates/users/create-fork' + constructQueryParams({id});
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to refresh token');
        }

        return data;
    } catch (error) {
        console.error("Error forking template:", error);
        return error as Error;
    }
};

export const updateTemplate = async ({
     id,
     code,
     language,
     title,
     explanation,
     tags,
     privacy
                                     }: Template): Promise<Template | Error> => {
    const url = '/api/templates/users/edit';
    const accessToken = localStorage.getItem("accessToken"); // Retrieve auth token from local storage
    const parsedTags = parseTagsToCSV(tags as string[] || []);

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include auth token in the header
            },
            body: JSON.stringify({ id, code, language, title, explanation, tags: parsedTags, privacy }), // Send comment data in the body
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to refresh token');
        }

        return data // Return newly created templateId.
    } catch (error) {
        console.error("Error updating template:", error);
        return error as Error;
    }
};

export const deleteTemplate = async ({id}: Template): Promise<boolean | Error> => {
    const url = '/api/templates/users/edit';
    const accessToken = localStorage.getItem("accessToken");

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ id }),
        });

        const data = await response.json();
        if (!response.ok) {
            return new Error((data as ErrorResponse).error || 'Failed to refresh token');
        }

        return response.ok;
    } catch (error) {
        console.error("Error deleting comment:", error);
        return error as Error;
    }
};