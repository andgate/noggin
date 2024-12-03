import { Card, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconFolderPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

interface DirectoryPickerProps {
    onSelect: (path: string) => void
}

export function DirectoryPicker({ onSelect }: DirectoryPickerProps) {
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        const preventDefault = (e: DragEvent) => e.preventDefault()
        window.addEventListener('dragover', preventDefault)
        window.addEventListener('drop', preventDefault)

        return () => {
            window.removeEventListener('dragover', preventDefault)
            window.removeEventListener('drop', preventDefault)
        }
    }, [])

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        console.log(
            'Dropped files:',
            Array.from(files).map((f) => f.path)
        )

        if (files.length > 0) {
            const paths = await window.electron.ipcRenderer.invoke('handle-folder-drop', {
                filePaths: Array.from(files).map((f) => f.path),
            })
            console.log('Received paths from electron:', paths)

            if (paths && paths.length > 0 && paths[0]) {
                console.log('Selected path:', paths[0])
                onSelect(paths[0])
            }
        }
    }

    const handleClick = async () => {
        const path = await window.api.dialog.showDirectoryPicker()
        console.log('Dialog selected path:', path)
        if (path) {
            onSelect(path)
        }
    }

    return (
        <Card
            shadow="sm"
            padding="lg"
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: isDragging ? 'var(--mantine-color-blue-filled)' : 'transparent',
                backgroundColor: isDragging ? 'var(--mantine-color-blue-light)' : undefined,
                transition: 'all 200ms ease',
            }}
        >
            <UnstyledButton onClick={handleClick} style={{ width: '100%' }}>
                <Stack align="center" gap="md">
                    <IconFolderPlus size={32} />
                    <Text size="xl">Drop a folder here or click to select</Text>
                    <Text size="sm" c="dimmed">
                        Drag and drop a folder or click to browse
                    </Text>
                </Stack>
            </UnstyledButton>
        </Card>
    )
}
