import { Group, Stack, Text, Title } from '@mantine/core'
import { Mod } from '@noggin/types/module-types'
import { formatDate } from '../common/format'

type ModuleInfoPanelProps = {
    module: Mod
}

export function ModuleInfoPanel({ module }: ModuleInfoPanelProps) {
    return (
        <Stack gap="md">
            <Title order={3}>Module Overview</Title>
            <Text>{module.path}</Text>

            {/* Module Stats */}
            <Group>
                <Text c="dimmed">Created:</Text>
                <Text>{formatDate(module.createdAt)}</Text>
            </Group>
            <Group>
                <Text c="dimmed">Last Updated:</Text>
                <Text>{formatDate(module.updatedAt)}</Text>
            </Group>

            {/* Source Files */}
            <Stack gap="xs">
                <Text fw={500}>Source Files:</Text>
                {module.sources.map((source, index) => (
                    <Text key={index} size="sm">
                        {source}
                    </Text>
                ))}
            </Stack>

            {/* Submissions */}
            <Stack gap="xs">
                <Text fw={500}>Recent Submissions:</Text>
                {module.submissions.length === 0 ? (
                    <Text size="sm" c="dimmed">
                        No submissions yet
                    </Text>
                ) : (
                    module.submissions.map((submission) => (
                        <Group key={submission.id}>
                            <Text size="sm">{submission.quizTitle}</Text>
                            <Text size="sm" c="dimmed">
                                {formatDate(submission.completedAt)}
                            </Text>
                            {submission.grade && <Text size="sm">Grade: {submission.grade}%</Text>}
                        </Group>
                    ))
                )}
            </Stack>
        </Stack>
    )
}
