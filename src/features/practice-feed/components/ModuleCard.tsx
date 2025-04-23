import { useGetDueModules } from '@/core/hooks/usePracticeFeedHooks'
import { ActionIcon, Button, Card, Group, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconHistory, IconPlayerPlay, IconPlus, IconTrash } from '@tabler/icons-react'
import Module from 'module'

interface ModuleCardProps {
  mod: Module
  onModuleClick: (moduleId: string) => void
  onStartQuiz: (moduleId: string, quizId: string) => void
  onOpenCreateQuizWizard: (moduleId: string, sources: string[]) => void
  onDelete: (moduleId: string) => void
  isDeleting: boolean
}

export default function ModuleCard({
  mod,
  onModuleClick,
  onStartQuiz,
  onOpenCreateQuizWizard,
  onDelete,
  isDeleting,
}: ModuleCardProps) {
  const { data: latestCreatedQuiz, isLoading: isLoadingQuizCheck } = useGetDueModules()

  const handleQuizAction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoadingQuizCheck) return

    if (!latestCreatedQuiz) {
      // Extract source paths before calling the handler
      const sourcePaths = mod.module_sources.map((s) => s.storage_object_path)
      if (sourcePaths.length === 0) {
        notifications.show({
          title: 'Cannot Create Quiz',
          message: 'This module has no source content to generate a quiz from.',
          color: 'orange',
        })
        return
      }
      onOpenCreateQuizWizard(mod.id, sourcePaths)
      return
    }

    try {
      const latestSubmittedQuiz = await queryClient.fetchQuery(
        latestSubmittedQuizByModuleQueryOptions(mod.id)
      )

      // Use submitted or fallback to created
      onStartQuiz(mod.id, latestSubmittedQuiz?.id ?? latestCreatedQuiz.id)
    } catch (err) {
      notifications.show({
        title: 'Error Starting Quiz',
        message: err instanceof Error ? err.message : 'Could not determine which quiz to start.',
        color: 'red',
      })
    }
  }

  const buttonText = isLoadingQuizCheck
    ? 'Loading...'
    : latestCreatedQuiz
      ? 'Start Quiz'
      : 'Create Quiz'
  const buttonIcon = latestCreatedQuiz ? <IconPlayerPlay size={14} /> : <IconPlus size={14} />

  return (
    <Card
      key={mod.id}
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        width: '280px',
        height: '180px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onModuleClick(mod.id)}
    >
      <div style={{ flexGrow: 1 }}>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="sm" truncate>
            {mod.title}
          </Text>
        </Group>
        <Group gap={8} mb="md">
          <Text size="xs" c="dimmed">
            Created {new Date(mod.created_at).toLocaleDateString()}
          </Text>
        </Group>
      </div>

      <Group justify="space-between" mt="auto">
        <Button
          variant="light"
          size="xs"
          leftSection={buttonIcon}
          onClick={handleQuizAction}
          title={latestCreatedQuiz ? 'Start the most recent quiz' : 'Create a quiz for this module'}
          disabled={isLoadingQuizCheck}
        >
          {buttonText}
        </Button>
        <Group gap={8}>
          <ActionIcon variant="subtle" size="md" title="Generate New Quiz (AI)">
            <IconPlus size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" size="md" title="Review Submissions">
            <IconHistory size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="md"
            title="Delete Module"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(mod.id)
            }}
            disabled={isDeleting}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  )
}
