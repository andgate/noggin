import { useGetQuizzesByModule } from '@/core/hooks/useQuizHooks'
import { ModuleSource } from '@/core/types/module-source.types'
import { Module } from '@/core/types/module.types'
import { formatDate } from '@/shared/utils/format'
import { Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconFile } from '@tabler/icons-react'

export interface ModuleDetailsProps {
  mod: Module
}

export function ModuleDetails({ mod }: ModuleDetailsProps) {
  // Fetch quizzes to get the count
  const { data: quizzesData, isLoading: isLoadingQuizCount } = useGetQuizzesByModule(module.id)
  const quizCount = quizzesData?.length ?? 0

  const truncatedTextStyle = {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    maxWidth: '100%',
  }

  // Map box numbers to natural language mastery levels
  const getMasteryLevel = (boxNumber: number | null) => {
    if (boxNumber === null || boxNumber < 1) return 'Not Started'
    const levels = {
      1: 'Beginner',
      2: 'Learning',
      3: 'Familiar',
      4: 'Confident',
      5: 'Mastered',
    }
    return levels[boxNumber as keyof typeof levels] || 'Unknown'
  }

  const lastReviewedDate = mod.stats.lastReviewedAt ? formatDate(mod.stats.lastReviewedAt) : 'Never'
  const nextReviewDate = mod.stats.nextReviewAt ? formatDate(mod.stats.nextReviewAt) : 'N/A'

  return (
    <Stack
      id="module-details"
      gap="md"
      p="md"
      style={{ height: '100%', width: '100%', maxWidth: '100%' }}
    >
      <Title order={4}>{mod.title}</Title>

      {/* Module Stats */}
      <Stack id="module-stats" gap="xs">
        <Text fw={500}>Module Info</Text>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Created:
          </Text>
          <Text size="sm">{formatDate(mod.createdAt)}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Last Updated:
          </Text>
          <Text size="sm">{mod.updatedAt ? formatDate(mod.updatedAt) : 'Never'}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Quiz Count:
          </Text>
          {isLoadingQuizCount ? <Loader size="xs" /> : <Text size="sm">{quizCount}</Text>}
        </Group>
      </Stack>

      {/* Spaced Repetition Stats */}
      <Stack id="learning-progress" gap="xs">
        <Text fw={500}>Learning Progress</Text>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Mastery Level:
          </Text>
          <Text size="sm">{getMasteryLevel(mod.stats.currentBox)}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Box:
          </Text>
          <Text size="sm">{mod.stats.currentBox ?? 1}/5</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Last Reviewed:
          </Text>
          {/* Use formatted date from stats */}
          <Text size="sm">{lastReviewedDate}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Next Review:
          </Text>
          {/* Use formatted date from stats */}
          <Text size="sm">{nextReviewDate}</Text>
        </Group>
      </Stack>

      {/* Source Files */}
      <Stack id="source-files" gap="xs">
        <Text fw={500}>Source Files</Text>
        <div
          style={{
            maxHeight: '200px',
            overflow: 'auto',
            width: '100%',
          }}
        >
          {mod.sources.map((source: ModuleSource) => (
            <Tooltip
              key={source.id}
              label={source.fileName}
              openDelay={500}
              position="right"
              withinPortal
            >
              <Group gap="xs" style={{ alignItems: 'center' }}>
                <IconFile size={14} />
                <Text size="sm" style={truncatedTextStyle}>
                  {source.fileName}
                </Text>
              </Group>
            </Tooltip>
          ))}
          {mod.sources.length === 0 && (
            <Text size="sm" c="dimmed">
              No source files.
            </Text>
          )}
        </div>
      </Stack>
    </Stack>
  )
}
