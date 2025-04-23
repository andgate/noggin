import { moduleQueryOptions, useModule } from '@/core/hooks/useModuleHooks'
import { ModulePage } from '@/features/view-module/ModulePage'
import { Loader } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/module/view/$moduleId')({
  loader: ({ params, context }) => {
    if (!context.queryClient) {
      console.error('QueryClient not found in route context!')
      throw new Error('QueryClient required in route context for pre-fetching.')
    }
    return context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId))
  },
  component: ModuleViewRoot,
  // errorComponent: ModuleErrorComponent, // Example
})

function ModuleViewRoot() {
  const { moduleId } = Route.useParams()
  const { data: mod, isLoading, isError, error } = useModule(moduleId)

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

  if (!mod) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Module not found or data is empty.
      </div>
    )
  }

  return <ModulePage mod={mod} />
}

// Optional: Define an Error Component if needed
// function ModuleErrorComponent({ error }: { error: Error }) {
//   return <div>Error loading module: {error.message}</div>;
// }
