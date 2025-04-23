import { Button, Group, Stack, Text } from '@mantine/core'
import { Dropzone, FileWithPath } from '@mantine/dropzone'
import { IconFileText, IconUpload, IconX } from '@tabler/icons-react'
import { SourceList } from './SourceList'

interface SourceSelectionViewProps {
  files: File[]
  onAddFiles: (files: FileWithPath[]) => void
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
        {/* Replace custom FileDropzone with Mantine Dropzone */}
        <Dropzone
          onDrop={onAddFiles}
          onReject={(rejectedFiles) => console.log('rejected files', rejectedFiles)}
          // maxSize={5 * 1024 ** 2} // Example: 5MB limit - adjust as needed
          // accept={...} // Add specific MIME types if needed
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // Ensure it fills space
          disabled={isLoading} // Disable when generating
        >
          <Group
            justify="center"
            gap="xl"
            mih={150} // Adjust min height as needed
            style={{ pointerEvents: 'none', flex: 1 }}
          >
            <Dropzone.Accept>
              <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileText size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag files here or click to select
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Attach source materials (PDF, TXT, etc.)
              </Text>
            </div>
          </Group>
        </Dropzone>

        {/* Display the SourceList below the dropzone */}
        {files.length > 0 && (
          <SourceList
            files={files}
            onRemove={onRemoveFile}
            style={{ marginTop: 'var(--mantine-spacing-md)' }}
          />
        )}
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
