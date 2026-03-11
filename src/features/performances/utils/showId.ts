export function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}

export function buildShowId(showName: string, date: string): string {
    return `${slugify(showName)}-${date}`;
}