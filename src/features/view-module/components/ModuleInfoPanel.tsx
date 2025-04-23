import { useGetSubmissionsByModule } from '@/core/hooks/useSubmissionHooks'
import type { Tables } from '@/shared/types/database.types'
import { formatDate } from '@/shared/utils/format'
import { Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core'
import { ModuleSubmissionsTable } from './ModuleSubmissionsTable'

// Define new types based on Supabase schema
type DbModule = Tables<'modules'>
type DbModuleStats = Tables<'module_stats'>
type DbModuleSource = Tables<'module_sources'>

// Updated Props
type ModuleInfoPanelProps = {
  module: DbModule
  stats: DbModuleStats
  sources: DbModuleSource[]
}

export function ModuleInfoPanel({ module, stats, sources }: ModuleInfoPanelProps) {
  const truncatedTextStyle = {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    maxWidth: '100%',
  }

  // Fetch submissions
  const {
    data: submissions,
    isLoading: isLoadingSubmissions,
    // isError: isErrorSubmissions, // Optional: Add error handling
    // error: errorSubmissions,
  } = useGetSubmissionsByModule(module.id)

  // Get the most recent submission date from fetched data
  const getLastReviewedDate = () => {
    if (isLoadingSubmissions || !submissions || submissions.length === 0) {
      return 'Never'
    }

    // Filter submissions that have a non-null submitted_at date
    const validSubmissions = submissions.filter(
      (s) => s.submitted_at !== null
    ) as (DbSubmissionWithQuizTitle & { submitted_at: string })[] // Assert type after filtering

    if (validSubmissions.length === 0) {
      return 'Never' // Or 'Pending' if appropriate
    }

    // Sort valid submissions by submitted_at (now guaranteed to be string)
    const mostRecentSubmission = [...validSubmissions].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )[0]

    // submitted_at is now guaranteed to be a string
    return formatDate(mostRecentSubmission.submitted_at)
  }

  return (
    <Stack
      id="module-info-panel"
      gap="md"
      style={{ height: '100%', width: '100%', maxWidth: '100%' }}
    >
      {/* Use new module fields */}
      <Title order={3}>{module.title}</Title>

      {/* Module Overview */}
      <Stack id="module-overview" gap="xs">
        <Text fw={500}>Overview:</Text>
        <Text>{module.overview || 'No overview provided.'}</Text> {/* Handle null overview */}
      </Stack>

      {/* Module Stats - Use new module fields */}
      <div id="module-stats">
        <Group>
          <Text c="dimmed">Created:</Text>
          <Text>{formatDate(module.created_at)}</Text>
        </Group>
        <Group>
          <Text c="dimmed">Last Updated:</Text>
          <Text>{formatDate(module.updated_at)}</Text>
        </Group>
        {/* Quiz Count needs to be fetched or passed separately */}
      </div>

      {/* Spaced Repetition Stats - Use new stats fields */}
      {stats && (
        <Stack id="spaced-repetition-stats" gap="xs">
          <Text fw={500}>Learning Progress:</Text>
          <Group>
            <Text c="dimmed">Current Box:</Text>
            <Text>{stats.current_box}/5</Text>
          </Group>
          <Group>
            <Text fw="bold">Last Reviewed:</Text>
            <Text>{isLoadingSubmissions ? <Loader size="xs" /> : getLastReviewedDate()}</Text>
          </Group>
          <Group>
            <Text fw="bold">Next Review:</Text>
            {/* Handle null next_review_at */}
            <Text>{stats.next_review_at ? formatDate(stats.next_review_at) : 'Not scheduled'}</Text>
          </Group>
        </Stack>
      )}

      {/* Source Files - Use new sources fields */}
      <Stack id="source-files-section" gap="xs" style={{ width: '100%' }}>
        <Text fw={500}>Source Files:</Text>
        <div
          id="source-files-list"
          style={{
            maxHeight: '150px',
            overflow: 'auto',
            width: '100%',
          }}
        >
          {sources.map((source) => (
            <Tooltip
              key={source.id}
              label={source.storage_object_path}
              openDelay={800}
              position="bottom"
              withinPortal
            >
              <Text size="sm" style={truncatedTextStyle}>
                {source.file_name}
              </Text>
            </Tooltip>
          ))}
          {sources.length === 0 && (
            <Text size="sm" c="dimmed">
              No source files associated.
            </Text>
          )}
        </div>
      </Stack>

      {/* Submissions - Pass fetched submissions */}
      <Stack id="submissions-section" gap="xs" style={{ width: '100%' }}>
        <Text fw={500}>Recent Submissions:</Text>
        <div
          id="submissions-list"
          style={{
            maxHeight: '200px',
            overflow: 'auto',
            width: '100%',
          }}
        >
          {isLoadingSubmissions ? (
            <Group justify="center" p="md">
              <Loader />
            </Group>
          ) : (
            // Pass module and fetched submissions
            <ModuleSubmissionsTable module={module} submissions={submissions || []} />
          )}
        </div>
      </Stack>
    </Stack>
  )
}
