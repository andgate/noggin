import { Library } from '@noggin/types/library-types'
import { LibraryPage } from '@renderer/pages/Library'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library/view/$libraryId')({
    component: LibraryViewRoot,
    loader: async ({ params }): Promise<Library> => {
        const libraries = await window.api.library.getAllLibraries()
        const library = libraries.find((lib) => lib.metadata.slug === params.libraryId)
        if (!library) throw new Error(`Library not found: ${params.libraryId}`)
        return library
    },
})

function LibraryViewRoot() {
    const library = Route.useLoaderData()

    const { data: modules = [] } = useQuery({
        queryKey: ['moduleOverviews'],
        queryFn: () => window.api.modules.getModuleOverviews(),
    })

    return <LibraryPage library={library} modules={modules} />
}
