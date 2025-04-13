import { allModulesQueryOptions } from '@noggin/hooks/useModuleHooks'
import { LibraryPage } from '@noggin/pages/Library'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library')({
  // Add loader to pre-fetch all modules
  loader: ({ context }) => {
    if (!context.queryClient) {
      console.error('QueryClient not found in route context!')
      throw new Error('QueryClient required in route context for pre-fetching.')
    }
    // Ensure the data for all modules is fetched or available in cache
    return context.queryClient.ensureQueryData(allModulesQueryOptions())
  },
  component: LibraryViewRoot,
})

function LibraryViewRoot() {
  return <LibraryPage />
}
