import { LibraryPage } from '@renderer/pages/Library'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library/view/$libraryId')({
    component: LibraryViewRoot,
})

function libraryQueryOptions(libraryId: string) {
    return queryOptions({
        queryKey: ['library', libraryId],
        queryFn: async () => {
            const libraries = await window.api.library.getAllLibraries()
            const library = libraries.find((lib) => lib.metadata.slug === libraryId)
            if (!library) throw new Error(`Library not found: ${libraryId}`)
            return library
        },
    })
}

function moduleQueryOptions(libraryId: string) {
    return queryOptions({
        queryKey: ['moduleOverviews', libraryId],
        queryFn: () => window.api.modules.getModuleOverviews(libraryId),
    })
}

function LibraryViewRoot() {
    const { libraryId } = Route.useParams()

    const {
        data: library,
        isPending: isLibraryLoading,
        error: libraryError,
    } = useQuery(libraryQueryOptions(libraryId))
    const { data: modules = [], isPending: isModulesLoading } = useQuery(
        moduleQueryOptions(libraryId)
    )

    if (isLibraryLoading || isModulesLoading) {
        return <div>Loading...</div>
    }

    if (libraryError) {
        return <div>Error: {libraryError.message}</div>
    }

    return <LibraryPage library={library} modules={modules} />
}
