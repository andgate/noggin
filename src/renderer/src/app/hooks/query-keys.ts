export const libraryKeys = {
    all: ['libraries'] as const,
    detail: (slug: string) => ['library', slug] as const,
}
