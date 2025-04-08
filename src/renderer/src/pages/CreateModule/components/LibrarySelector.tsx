import { Button, Group, Loader, Select, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useReadAllLibraries } from '@renderer/app/hooks/library/use-read-all-libraries'
import { CreateLibraryModal } from '@renderer/components/CreateLibraryModal'

interface LibrarySelectorProps {
    onSelect: (librarySlug: string | null) => void
    selectedSlug?: string
}

export function LibrarySelector({ onSelect, selectedSlug }: LibrarySelectorProps) {
    const { data: libraries = [], isLoading } = useReadAllLibraries()
    const [opened, { open, close }] = useDisclosure(false)

    // Handle the case when a library is created
    const handleLibraryCreated = (librarySlug: string) => {
        onSelect(librarySlug)
    }

    const data = libraries.map((lib) => ({
        value: lib.slug, // Use slug as value
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
                    value={selectedSlug}
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
