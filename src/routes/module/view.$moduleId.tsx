import { Loader } from '@mantine/core'
import { moduleDetailsQueryOptions } from '@noggin/hooks/useModuleHooks'
import { ModulePage } from '@noggin/pages/Module'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/module/view/$moduleId')({
  loader: ({ params, context }) => {
    if (!context.queryClient) {
      console.error('QueryClient not found in route context!')
      throw new Error('QueryClient required in route context for pre-fetching.')
    }
    return context.queryClient.ensureQueryData(moduleDetailsQueryOptions(params.moduleId))
  },
  component: ModuleViewRoot,
  // errorComponent: ModuleErrorComponent, // Example
})

function ModuleViewRoot() {
  const { moduleId } = Route.useParams()
  const {
    data: moduleData,
    isLoading,
    isError,
    error,
  } = useQuery(moduleDetailsQueryOptions(moduleId))

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-600">
        Error loading module: {error?.message || 'Unknown error'}
      </div>
    )
  }

  if (!moduleData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Module not found or data is empty.
      </div>
    )
  }

  return (
    <ModulePage module={moduleData.module} stats={moduleData.stats} sources={moduleData.sources} />
  )
}

// Optional: Define an Error Component if needed
// function ModuleErrorComponent({ error }: { error: Error }) {
//   return <div>Error loading module: {error.message}</div>;
// }
