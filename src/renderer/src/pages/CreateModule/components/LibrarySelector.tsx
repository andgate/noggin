import { Button, Group, Loader, Select, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useReadAllLibraries } from '@renderer/app/hooks/library/use-read-all-libraries'
import { CreateLibraryModal } from '@renderer/components/CreateLibraryModal'

interface LibrarySelectorProps {
    onSelect: (libraryId: string | null) => void
    selectedId?: string
}

export function LibrarySelector({ onSelect, selectedId }: LibrarySelectorProps) {
    const { data: libraries = [], isLoading } = useReadAllLibraries()
    const [opened, { open, close }] = useDisclosure(false)

    // Handle the case when a library is created
    const handleLibraryCreated = (libraryId: string) => {
        onSelect(libraryId)
    }

    const data = libraries.map((lib) => ({
        value: lib.id,
        label: lib.name,
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
