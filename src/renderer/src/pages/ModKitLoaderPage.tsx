import { Button, Card, FileInput, Group, Text } from '@mantine/core'
import { useModkit } from '@renderer/hooks/use-mod-kit'
import { useState } from 'react'

export default function ModKitLoaderPage() {
    const { setModkit } = useModkit()
    const [selectedFolder, setSelectedFolder] = useState<File | null>(null)

    const handleFolderSelection = (payload: File | null) => {
        setSelectedFolder(payload)
    }

    const handleLoadModkit = async () => {
        if (!selectedFolder) return

        try {
            await window.api.modkit.add(selectedFolder.path)
            const modkit = await window.api.modkit.load(selectedFolder.path)
            setModkit(modkit)
        } catch (error) {
            console.error('Failed to load modkit:', error)
            // Consider adding user feedback for errors
        }
    }

    return (
        <Card shadow="sm" padding="lg">
            <Text>Select a folder to use as your modkit:</Text>

            <FileInput
                placeholder="Pick a folder"
                onChange={handleFolderSelection}
                accept="application/json"
            />

            <Group justify="flex-end" mt="lg">
                <Button onClick={handleLoadModkit} disabled={!selectedFolder}>
                    Load Modkit
                </Button>
            </Group>
        </Card>
    )
}
