import { formatFileSize } from '@/shared/utils/format'
import { Divider, Group, Stack, Text } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useState } from 'react'

function DeleteButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <IconX
      size={14}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-6)',
        cursor: 'pointer',
      }}
    />
  )
}

interface SourceListProps {
  files: File[]
  onRemove: (index: number) => void
  style?: React.CSSProperties
}

export function SourceList({ files, onRemove, style }: SourceListProps) {
  if (files.length === 0) return null

  return (
    <Stack gap="xs" style={style}>
      <Text size="sm" fw={500} c="blue">
        Selected Materials:
      </Text>
      {files.map((file, index) => (
        <Stack key={`${file.name}-${index}`} gap={2}>
          <Group wrap="nowrap" justify="space-between">
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="sm"
                style={{
                  wordBreak: 'break-word',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={file.name}
              >
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                {formatFileSize(file.size)}
              </Text>
            </Stack>
            <DeleteButton onClick={() => onRemove(index)} />
          </Group>
          {index < files.length - 1 && <Divider />}
        </Stack>
      ))}
    </Stack>
  )
}
