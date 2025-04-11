import { Table, Text, Tooltip } from '@mantine/core'
import { formatDate } from '@noggin/app/common/format'
import type { Tables } from '@noggin/types/database.types'
import { useNavigate } from '@tanstack/react-router'

// Define new types based on Supabase schema
type DbModule = Tables<'modules'>
type DbSubmission = Tables<'submissions'>
// TODO: The submission hook needs to join with quizzes to get the title.
// For now, assume DbSubmission might have an optional quizTitle added by the hook.
type DbSubmissionWithQuizTitle = DbSubmission & { quizTitle?: string }

// Updated Props
type ModuleSubmissionsTableProps = {
  module: DbModule
  submissions: DbSubmissionWithQuizTitle[] // Expect an array of submissions
}

export function ModuleSubmissionsTable({ module, submissions }: ModuleSubmissionsTableProps) {
  const navigate = useNavigate()

  const truncatedTextStyle = {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    maxWidth: '100%',
  }

  const handleSubmissionClick = (submission: DbSubmission) => {
    navigate({
      to: '/submission/$libraryId/$moduleId/$quizId/$attempt',
      params: {
        libraryId: module.library_id, // Use new field
        moduleId: module.id, // Use new field
        quizId: submission.quiz_id, // Use new field
        attempt: submission.attempt_number.toString(), // Use new field
      },
    })
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No submissions yet
      </Text>
    )
  }

  return (
    <Table
      striped
      highlightOnHover
      withColumnBorders={false}
      withTableBorder={false}
      style={{ tableLayout: 'fixed' }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: '40%' }}>Quiz</Table.Th>
          <Table.Th style={{ width: '25%' }}>Date</Table.Th>
          <Table.Th style={{ width: '15%' }}>Attempt</Table.Th>
          <Table.Th style={{ width: '20%' }}>Grade</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {/* Map over the passed submissions prop */}
        {submissions.map((submission) => (
          <Table.Tr
            key={submission.id} // Use submission ID as key
            onClick={() => handleSubmissionClick(submission)}
            style={{ cursor: 'pointer' }}
            className="hover-highlight"
          >
            <Table.Td>
              {/* Use optional quizTitle, add fallback */}
              <Tooltip
                label={submission.quizTitle || submission.quiz_id}
                openDelay={800}
                position="bottom"
                withinPortal
              >
                <Text size="sm" style={truncatedTextStyle}>
                  {submission.quizTitle || 'Quiz ID: ' + submission.quiz_id.substring(0, 8)}
                </Text>
              </Tooltip>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="dimmed">
                {/* Handle null submitted_at */}
                {submission.submitted_at ? formatDate(submission.submitted_at) : 'Pending'}
              </Text>
            </Table.Td>
            <Table.Td>
              {/* Use new field */}
              <Text size="sm">{submission.attempt_number}</Text>
            </Table.Td>
            <Table.Td>
              {/* Use new field and handle null */}
              <Text size="sm">
                {submission.grade_percent !== null ? `${submission.grade_percent}%` : '-'}
              </Text>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
