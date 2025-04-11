// src/renderer/src/components/ModuleDetails/ModuleDetails.tsx
import { Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core' // Added Loader
import { formatDate } from '@noggin/app/common/format'
import { useGetQuizzesByModule } from '@noggin/hooks/useQuizHooks' // Import hook to get quiz count
import type { Tables } from '@noggin/types/database.types' // Use Tables helper
import { IconFile } from '@tabler/icons-react'

// Define types using Tables helper
type DbModule = Tables<'modules'>
type DbModuleSource = Tables<'module_sources'>
type DbModuleStats = Tables<'module_stats'>

// Updated Props
type ModuleDetailsProps = {
  module: DbModule
  stats: DbModuleStats
  sources: DbModuleSource[]
}

export function ModuleDetails({ module, stats, sources }: ModuleDetailsProps) {
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

  const lastReviewedDate = stats.last_reviewed_at ? formatDate(stats.last_reviewed_at) : 'Never'
  const nextReviewDate = stats.next_review_at ? formatDate(stats.next_review_at) : 'N/A'

  return (
    <Stack
      id="module-details"
      gap="md"
      p="md"
      style={{ height: '100%', width: '100%', maxWidth: '100%' }}
    >
      <Title order={4}>{module.title}</Title>

      {/* Module Stats */}
      <Stack id="module-stats" gap="xs">
        <Text fw={500}>Module Info</Text>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Created:
          </Text>
          <Text size="sm">{formatDate(module.created_at)}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Last Updated:
          </Text>
          <Text size="sm">{formatDate(module.updated_at)}</Text>
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
          <Text size="sm">{getMasteryLevel(stats.current_box)}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Box:
          </Text>
          <Text size="sm">{stats.current_box ?? 0}/5</Text>
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
          {sources.map((source) => (
            <Tooltip
              key={source.id}
              label={source.file_name}
              openDelay={500}
              position="right"
              withinPortal
            >
              <Group gap="xs" style={{ alignItems: 'center' }}>
                <IconFile size={14} />
                <Text size="sm" style={truncatedTextStyle}>
                  {source.file_name}
                </Text>
              </Group>
            </Tooltip>
          ))}
          {sources.length === 0 && (
            <Text size="sm" c="dimmed">
              No source files.
            </Text>
          )}
        </div>
      </Stack>
    </Stack>
  )
}
