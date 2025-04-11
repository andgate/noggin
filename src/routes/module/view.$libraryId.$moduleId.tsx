import { Loader } from '@mantine/core'
import { getModuleWithDetails } from '@noggin/api/moduleApi'
import { moduleKeys } from '@noggin/hooks/query-keys'
import type { ModuleWithDetails } from '@noggin/hooks/useModuleHooks'
import { ModulePage } from '@noggin/pages/Module'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// Define query options for fetching module details
const moduleDetailsQueryOptions = (moduleId: string) =>
  queryOptions<ModuleWithDetails | null, Error>({
    queryKey: moduleKeys.detailWithDetails(moduleId),
    queryFn: () => getModuleWithDetails(moduleId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const Route = createFileRoute('/module/view/$libraryId/$moduleId')({
  // Use the loader to ensure data is fetched or available in cache
  loader: ({ params, context }) => {
    // Assuming queryClient is available in context as shown in the tutorial
    // If your setup differs, adjust how queryClient is accessed.
    if (!context.queryClient) {
      console.error('QueryClient not found in route context!')
      // Potentially throw an error or handle appropriately
      throw new Error('QueryClient required in route context for pre-fetching.')
    }
    return context.queryClient.ensureQueryData(moduleDetailsQueryOptions(params.moduleId))
  },
  component: ModuleViewRoot,
  // Add error component handling if desired, similar to the tutorial example
  // errorComponent: ModuleErrorComponent, // Example
})

// Root component to render the page using data from the query cache
function ModuleViewRoot() {
  const { moduleId } = Route.useParams()
  // Use useQuery to read the data ensured by the loader
  // Note: We use useQuery here, not useSuspenseQuery, as requested.
  // This might still show a brief loading state if the data becomes stale
  // and refetches in the background, but the initial load should be faster
  // due to the loader ensuring the data exists.
  const {
    data: moduleData,
    isLoading, // Reflects query loading state
    isError,
    error,
  } = useQuery(moduleDetailsQueryOptions(moduleId))

  // Handle loading state (might occur briefly on background refetch)
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {/* Use Mantine Loader */}
        <Loader />
      </div>
    )
  }

  // Handle error state
  if (isError) {
    // Using Mantine's Text component for error styling might be better,
    // but keeping simple div for now. Adjust styling as needed.
    return (
      <div className="flex h-full w-full items-center justify-center text-red-600">
        {' '}
        {/* Basic error color */}
        Error loading module: {error?.message || 'Unknown error'}
      </div>
    )
  }

  // Handle case where data is successfully fetched but is null/empty
  if (!moduleData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Module not found or data is empty.
      </div>
    )
  }

  // Pass the structured data from the query result to the page component
  // The TS error here points to ModulePage needing update, which is the next step.
  return (
    <ModulePage module={moduleData.module} stats={moduleData.stats} sources={moduleData.sources} />
  )
}

// Optional: Define an Error Component if needed
// function ModuleErrorComponent({ error }: { error: Error }) {
//   // Basic error display, enhance as needed
//   return <div>Error loading module: {error.message}</div>;
// }
