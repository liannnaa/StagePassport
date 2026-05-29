export function parseStoredDate(value: string): Date {
    const [month, day, year] = value.split('-').map(Number);
    const fullYear = year >= 70 ? 1900 + year : 2000 + year;

    return new Date(fullYear, month - 1, day);
}

export function formatStoredDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${month}-${day}-${year}`;
}

export function compareStoredDatesDesc(a: string, b: string): number {
    return parseStoredDate(b).getTime() - parseStoredDate(a).getTime();
}

export function compareStoredDatesAsc(a: string, b: string): number {
    return parseStoredDate(a).getTime() - parseStoredDate(b).getTime();
}