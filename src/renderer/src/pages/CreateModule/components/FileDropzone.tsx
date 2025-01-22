import { Group, rem, Text, UnstyledButton } from '@mantine/core'
import { SimpleFile } from '@noggin/types/electron-types'
import { IconFile } from '@tabler/icons-react'

interface FileDropzoneProps {
    onDrop: (files: SimpleFile[]) => void
    children?: React.ReactNode
}

export function FileDropzone({ onDrop, children }: FileDropzoneProps) {
    const handleClick = async () => {
        try {
            const files = await window.api.filesystem.showFilePicker()
            if (!files || files.length === 0) return
            onDrop(files)
        } catch (error) {
            console.error('Error selecting file:', error)
        }
    }

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        const droppedFiles = Array.from(event.dataTransfer.files)
        if (droppedFiles.length === 0) return

        try {
            const fileInfos = await Promise.all(
                droppedFiles.map((file) => window.api.filesystem.getFileInfo(file.path, true))
            )
            onDrop(fileInfos)
        } catch (error) {
            console.error('Error handling dropped files:', error)
        }
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
    }

    if (children) {
        return (
            <div style={{ flex: 1 }} onDrop={handleDrop} onDragOver={handleDragOver}>
                {children}
            </div>
        )
    }

    return (
        <UnstyledButton
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                flex: 1,
                borderStyle: 'dotted',
                borderWidth: '2px',
                borderRadius: 'var(--mantine-radius-md)',
                borderColor: 'var(--mantine-color-dark-4)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'background-color 150ms ease',
                '&:hover': {
                    backgroundColor: 'var(--mantine-color-dark-6)',
                },
            }}
        >
            <Group justify="center" gap="xl" mih={220}>
                <IconFile
                    style={{
                        width: rem(52),
                        height: rem(52),
                        color: 'var(--mantine-color-dimmed)',
                    }}
                    stroke={1.5}
                />

                <div>
                    <Text size="xl" inline>
                        Click to select files
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                        Supported files: PDF, TXT, and more
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    )
}
