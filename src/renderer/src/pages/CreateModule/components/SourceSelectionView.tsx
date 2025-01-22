import { Button, Group, Stack } from '@mantine/core'
import { SimpleFile } from '@noggin/types/electron-types'
import { FileDropzone } from './FileDropzone'
import { SourceList } from './SourceList'

interface SourceSelectionViewProps {
    files: SimpleFile[]
    onAddFiles: (files: SimpleFile[]) => void
    onRemoveFile: (index: number) => void
    onGenerate: () => void
    onClose: () => void
    isLoading: boolean
}

export function SourceSelectionView({
    files,
    onAddFiles,
    onRemoveFile,
    onGenerate,
    onClose,
    isLoading,
}: SourceSelectionViewProps) {
    return (
        <Stack gap="xl" style={{ flex: 1 }}>
            <Stack style={{ flex: 1 }}>
                <FileDropzone onDrop={onAddFiles}>
                    {files.length > 0 && <SourceList files={files} onRemove={onRemoveFile} />}
                </FileDropzone>
            </Stack>

            <Group justify="flex-end">
                <Button variant="subtle" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onGenerate} loading={isLoading} disabled={files.length === 0}>
                    Generate
                </Button>
            </Group>
        </Stack>
    )
}
