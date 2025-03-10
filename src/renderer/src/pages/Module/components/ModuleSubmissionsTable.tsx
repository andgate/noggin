import { Table, Text, Tooltip } from '@mantine/core'
import { Mod } from '@noggin/types/module-types'
import { formatDate } from '@renderer/app/common/format'
import { useNavigate } from '@tanstack/react-router'

type ModuleSubmissionsTableProps = {
    module: Mod
}

export function ModuleSubmissionsTable({ module }: ModuleSubmissionsTableProps) {
    const navigate = useNavigate()

    const truncatedTextStyle = {
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis' as const,
        maxWidth: '100%',
    }

    const handleSubmissionClick = (submission: (typeof module.submissions)[0]) => {
        navigate({
            to: '/submission/$libraryId/$moduleId/$quizId/$attempt',
            params: {
                libraryId: module.metadata.libraryId,
                moduleId: module.metadata.id,
                quizId: submission.quizId,
                attempt: submission.attemptNumber.toString(),
            },
        })
    }

    if (module.submissions.length === 0) {
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
                {module.submissions.map((submission) => (
                    <Table.Tr
                        key={submission.attemptNumber}
                        onClick={() => handleSubmissionClick(submission)}
                        style={{ cursor: 'pointer' }}
                        className="hover-highlight"
                    >
                        <Table.Td>
                            <Tooltip
                                label={submission.quizTitle}
                                openDelay={800}
                                position="bottom"
                                withinPortal
                            >
                                <Text size="sm" style={truncatedTextStyle}>
                                    {submission.quizTitle}
                                </Text>
                            </Tooltip>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm" c="dimmed">
                                {formatDate(submission.completedAt)}
                            </Text>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm">{submission.attemptNumber}</Text>
                        </Table.Td>
                        <Table.Td>
                            <Text size="sm">{submission.grade ? `${submission.grade}%` : '-'}</Text>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )
}
