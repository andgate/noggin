import { LibraryPage } from '@renderer/pages/Library'
import { useReadLibrary } from '@renderer/app/hooks/library/use-read-library' // Import the hook
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from '@mantine/core' // Import Loader for loading state

export const Route = createFileRoute('/library/view/$libraryId')({
    component: LibraryViewRoot,
})

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
        isLoading: isLibraryLoading,
        isError: isLibraryError,
        error: libraryError,
    } = useReadLibrary(libraryId)
    const { data: modules = [], isPending: isModulesLoading } = useQuery(
        moduleQueryOptions(libraryId)
    )

    if (isLibraryLoading || isModulesLoading) {
        return <Loader />
    }

    if (isLibraryError) {
        return <div>Error: {libraryError.message}</div>
    }

    // Handle case where library might be undefined after loading if not found
    if (!library) {
        return <div>Library not found.</div>
    }

    return <LibraryPage library={library} modules={modules} />
}
