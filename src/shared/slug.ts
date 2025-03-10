export function slugify(str: string): string {
    const parts = str
        .trim() // Remove leading/trailing whitespace
        .split(/\s+/) // Split on one or more whitespace chars
        .map(
            (part) =>
                part
                    .split('') // Split into characters
                    .filter((char) => /[a-zA-Z0-9]/.test(char)) // Keep only alphanumeric
                    .join('') // Rejoin characters
                    .toLowerCase() // Then convert to lowercase
        )
        .filter(Boolean) // Remove empty parts after cleaning

    return parts.length > 0
        ? parts.join('_').substring(0, 255) // Join with underscores and limit length
        : '' // Return empty string if no parts remain
}

export function createModuleId(moduleSlug: string, createdAt: string): string {
    console.log(`createModuleId called with slug: ${moduleSlug}, createdAt: ${createdAt}`)
    const timestamp = createdAt
        .replace(/[-:]/g, '') // Remove dashes and colons
        .replace(/\.\d{3}/, '') // Remove milliseconds
    console.log(`Formatted timestamp: ${timestamp}`)
    const moduleId = `${moduleSlug}-${timestamp}`
    console.log(`Generated module ID: ${moduleId}`)
    return moduleId
}
