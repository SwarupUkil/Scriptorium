import { SUPPORTED_LANGUAGES } from './validateConstants';

/**
 * Parses a given language string and normalizes it to a supported language name.
 * @param language - The input language string to parse.
 * @returns The standardized language name or `null` if not found.
 */
export function parseLanguage(language: string | undefined): string | null {
    if (typeof language !== "string") return null;

    const normalizedLang = language.trim().toLowerCase();

    for (const [, variations] of Object.entries(SUPPORTED_LANGUAGES)) {
        if (variations.includes(normalizedLang)) {
            return variations[0]; // Return standardized language name
        }
    }

    return null; // Return null if no match found
}