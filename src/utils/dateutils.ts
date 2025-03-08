import dayjs from 'dayjs';

export function convertDateStringToOnlyDate(dateString?: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }
    return dayjs(date).format('DD/MM/YYYY');
}
