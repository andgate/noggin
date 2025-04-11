import { Alert, Loader } from '@mantine/core' // Import Loader for loading state
import { useLibrary } from '@noggin/hooks/useLibraryHooks' // Import the new hook
import { LibraryPage } from '@noggin/pages/Library'
import { Tables } from '@noggin/types/database.types' // Import DbLibrary type
import { IconAlertCircle } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'

type DbLibrary = Tables<'libraries'>

export const Route = createFileRoute('/library/view/$libraryId')({
  component: LibraryViewRoot,
})

function LibraryViewRoot() {
  const { libraryId } = Route.useParams()

  const { data: library, isLoading, isError, error } = useLibrary(libraryId)

  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error loading library" color="red">
        {error?.message || 'An unknown error occurred.'}
      </Alert>
    )
  }

  // Handle case where library might be undefined after loading if not found
  if (!library) {
    return <div>Library not found.</div>
  }

  // Pass the library data (which should be DbLibrary type) to LibraryPage
  return <LibraryPage library={library as DbLibrary} />
}
