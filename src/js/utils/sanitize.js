export function sanitizeText(str, maxLength) {
    let cleaned = str.trim().replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');
    if (maxLength && cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength);
    }
    return cleaned;
}
