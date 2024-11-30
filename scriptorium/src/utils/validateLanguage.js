import { SUPPORTED_LANGUAGES } from './validateConstants';

export function parseLanguage(language) {
    if (typeof language !== "string") return null;

    const normalizedLang = language.trim().toLowerCase();

    for (const [, variations] of Object.entries(SUPPORTED_LANGUAGES)) {
        if (variations.includes(normalizedLang)) {
            return variations[0]; // Return standardized language name
        }
    }

    return null; // Return null if no match found
}