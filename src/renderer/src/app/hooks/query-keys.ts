export const libraryKeys = {
    all: ['libraries'] as const,
    detail: (libraryId: string) => ['library', libraryId] as const,
}
