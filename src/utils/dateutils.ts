export function convertDateStringToOnlyDate(dateString?: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }
    return date.toISOString().substring(0, 10);
}