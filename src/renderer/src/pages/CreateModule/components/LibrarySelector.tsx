import { Button, Group, Select, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Library } from '@noggin/types/library-types'
import { useLibrary } from '@renderer/app/hooks/use-library'
import { CreateLibraryModal } from '@renderer/components/CreateLibraryModal'
import { useEffect, useState } from 'react'

interface LibrarySelectorProps {
    onSelect: (libraryPath: string | null) => void
    selectedPath?: string
}

export function LibrarySelector({ onSelect, selectedPath }: LibrarySelectorProps) {
    const [libraries, setLibraries] = useState<Library[]>([])
    const [opened, { open, close }] = useDisclosure(false)
    const { getAllLibraries } = useLibrary()

    useEffect(() => {
        loadLibraries()
    }, [])

    const loadLibraries = async () => {
        const libs = await getAllLibraries()
        setLibraries(libs)
    }

    const handleLibraryCreated = async (libraryPath: string) => {
        await loadLibraries()
        onSelect(libraryPath)
    }

    const data = libraries.map((lib) => ({
        value: lib.path,
        label: lib.metadata.name,
    }))

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>
                Select Library
            </Text>
            <Group>
                <Select
                    placeholder="Choose a library"
                    data={data}
                    value={selectedPath}
                    onChange={onSelect}
                    style={{ flex: 1 }}
                />
                <Button variant="light" onClick={open}>
                    Create New
                </Button>
            </Group>

            <CreateLibraryModal opened={opened} onClose={close} onCreated={handleLibraryCreated} />
        </Stack>
    )
}
