import { Button, Group, Loader, Select, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { CreateLibraryModal } from '@noggin/components/CreateLibraryModal'
import { useLibraries } from '@noggin/hooks/useLibraryHooks'
import type { Tables } from '@noggin/types/database.types'

// Define DbLibrary type locally using the Tables helper
type DbLibrary = Tables<'libraries'>

interface LibrarySelectorProps {
  onSelect: (libraryId: string | null) => void
  selectedId?: string
}

export function LibrarySelector({ onSelect, selectedId }: LibrarySelectorProps) {
  // Use the correct hook
  const { data: libraries = [], isLoading } = useLibraries()
  const [opened, { open, close }] = useDisclosure(false)

  // Handle the case when a library is created
  const handleLibraryCreated = (libraryId: string) => {
    onSelect(libraryId)
  }

  // Add type annotation to 'lib' parameter
  const data = libraries.map((lib: DbLibrary) => ({
    value: lib.id,
    label: lib.name ?? 'Unnamed Library', // Add nullish coalescing for safety
  }))

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Select Library
      </Text>
      <Group>
        {isLoading && <Loader size="xs" />}
        <Select
          placeholder="Choose a library"
          data={data}
          value={selectedId}
          onChange={onSelect}
          style={{ flex: 1 }}
          disabled={isLoading}
        />
        <Button variant="light" onClick={open}>
          Create New
        </Button>
      </Group>

      <CreateLibraryModal opened={opened} onClose={close} onCreated={handleLibraryCreated} />
    </Stack>
  )
}
