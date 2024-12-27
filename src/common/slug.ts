export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
        .replace(/(^_|_$)/g, '') // Remove leading/trailing underscores
        .substring(0, 255) // Limit length for filesystem compatibility
}
