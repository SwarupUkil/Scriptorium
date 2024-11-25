import {fetchWithPagination, constructQueryParams} from "@/utils/frontend-helper/apiHelper";
import {SearchTemplatesParams} from "@/types/SearchType";
import {Template} from "@/types/TemplateType";

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