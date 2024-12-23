import React, { useCallback, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import {
    ActionMeta,
    GroupBase,
    MultiValue,
    OptionsOrGroups,
    SingleValue,
    StylesConfig,
} from "react-select";

import { searchTemplates } from "@/services/TemplateService";
import { Template } from "@/types/TemplateType";

// Because React Select expects { value, label } for each option,
// define TemplateOption that way.
interface TemplateOption {
    value: number;
    label: string;
}

interface TemplateSelectProps {
    isMulti?: boolean;

    // For multi-select, React-Select passes an array (MultiValue<TemplateOption>).
    // For single-select, it's a SingleValue<TemplateOption>.
    value: MultiValue<TemplateOption> | SingleValue<TemplateOption> | null;
    onChange: (
        newValue: MultiValue<TemplateOption> | SingleValue<TemplateOption>,
        actionMeta: ActionMeta<TemplateOption>
    ) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

function createMultiSelectStyles(isDarkMode: boolean): StylesConfig<TemplateOption, true> {
    return {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? "#6366F1" : "#D1D5DB",
            boxShadow: "none",

            // BG
            backgroundColor: isDarkMode
                ? state.isFocused
                    ? "#374151"
                    : "#1F2937"
                : state.isFocused
                    ? "#E5E7EB"
                    : "#F9FAFB",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
            zIndex: 9999,
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        singleValue: (provided) => ({
            ...provided,
            color: isDarkMode ? "#E5E7EB" : "#374151",
        }),
        input: (provided) => ({
            ...provided,
            color: isDarkMode ? "#E5E7EB" : "#374151",
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? "#4B5563" : "#E5E7EB",
            color: isDarkMode ? "#E5E7EB" : "#374151",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: isDarkMode ? "#E5E7EB" : "#374151",
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: isDarkMode ? "#E5E7EB" : "#374151",
            ":hover": {
                // Remove the background hover to keep it simpler
                backgroundColor: "inherit",
                color: "red",
            },
        }),
        option: (provided, state) => ({
            ...provided,
            // We'll keep the background static or minimal highlight on focus
            backgroundColor: state.isFocused
                ? isDarkMode
                    ? "#374151"
                    : "#E5E7EB"
                : isDarkMode
                    ? "#1F2937"
                    : "#FFFFFF",
            color: isDarkMode ? "#E5E7EB" : "#374151",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? "#9CA3AF" : "#6B7280",
        }),
    };
}

/** 2) Helper function to build SINGLE-SELECT styles */
function createSingleSelectStyles(isDarkMode: boolean): StylesConfig<TemplateOption, false> {
    return {
        control: (provided, state) => ({
            ...provided,
            minHeight: "2.25rem", // ~ match input height
            borderRadius: "0.375rem", // tailwind: rounded-md
            border: state.isFocused ? "1px solid #6366F1" : "1px solid #D1D5DB",
            boxShadow: "none",
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: "0 0.75rem", // match input px-3
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.375rem",
            border: "1px solid #D1D5DB",
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
            zIndex: 9999,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? "#9CA3AF" : "#6B7280",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDarkMode ? "#E5E7EB" : "#374151",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused
                ? isDarkMode
                    ? "#374151"
                    : "#E5E7EB"
                : isDarkMode
                    ? "#1F2937"
                    : "#FFFFFF",
            color: isDarkMode ? "#E5E7EB" : "#374151",
            cursor: "pointer",
        }),
    };
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({
                                                           isMulti = true,
                                                           value,
                                                           onChange,
                                                           placeholder = "Search for Templates...",
                                                           label,
                                                           className,
                                                       }) => {
    /**
     * Maintain a local state for dark mode detection (client-only).
     */
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Only run on client side
        if (typeof document !== "undefined") {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
    }, []);

    // loadOptions is called by React-Select whenever the user types,
    // or if we pass defaultOptions (which we do).
    // We do 'title: inputValue || ""' so an empty string returns "top 10" templates.
    const loadOptions = useCallback(
        async (
            inputValue: string
        ): Promise<OptionsOrGroups<TemplateOption, GroupBase<TemplateOption>>> => {
            try {
                const [results, ]: [Template[], any] = await searchTemplates({
                    skip: 0,
                    take: 10,
                    title: inputValue || "",
                });

                // Convert each Template to { value, label } so React Select can display it.
                return results.map((template) => ({
                    value: template.id as number,
                    label: `Id-${template.id}: ${template.title}`,
                }));
            } catch (error) {
                console.error("Error loading templates:", error);
                return [];
            }
        },
        []
    );

    const multiStyles = createMultiSelectStyles(isDarkMode);
    const singleStyles = createSingleSelectStyles(isDarkMode);
    const styles = isMulti ? multiStyles : singleStyles;

    return (
        <div className={className}>
            {label && (
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <AsyncSelect
                isMulti={isMulti ? true : undefined}
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                }
                styles={styles as StylesConfig<TemplateOption, typeof isMulti>}
                classNamePrefix="react-select"
            />
        </div>
    );
};

export default TemplateSelect;