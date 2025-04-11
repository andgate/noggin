import { Alert, Card, List, Stack, Text } from '@mantine/core'
import type { Json, Tables } from '@noggin/types/database.types'
import { IconAlertCircle } from '@tabler/icons-react'

// Define type using Tables utility
type DbQuestion = Tables<'questions'>

// Define the expected structure within the JSON choices
type ChoiceOption = {
  optionText: string
  // Add other potential fields if they exist in your JSON structure
}

type QuestionListProps = {
  questions: DbQuestion[]
}

export function QuestionList({ questions }: QuestionListProps) {
  // Helper function to safely parse JSON choices
  const parseChoices = (choicesJson: Json | null): ChoiceOption[] => {
    if (!choicesJson) return []
    try {
      // Assuming choicesJson is an array of objects matching ChoiceOption
      const parsed = JSON.parse(choicesJson as string) // Might need adjustment based on actual JSON format
      if (Array.isArray(parsed)) {
        // Basic validation if needed
        return parsed.filter((item): item is ChoiceOption => typeof item?.optionText === 'string')
      }
      return []
    } catch (error) {
      console.error('Failed to parse question choices JSON:', error, choicesJson)
      return []
    }
  }

  return (
    <Stack gap="md">
      {questions.map((question, index) => {
        const choices = parseChoices(question.choices)
        return (
          <Card key={question.id} shadow="sm" radius="sm" withBorder>
            <Card.Section withBorder inheritPadding py="xs" bg="dark.5">
              {/* Use question.sequence_order if available and preferred */}
              <Text fw={600}>Question {index + 1}</Text>
            </Card.Section>

            <Stack gap="md" p="md">
              {/* Use question_text */}
              <Text>{question.question_text}</Text>

              {/* Use question_type */}
              {question.question_type === 'multiple_choice' && choices.length > 0 && (
                <List type="ordered" spacing="xs">
                  {choices.map((choice, choiceIndex) => (
                    // Assuming choice object has optionText
                    <List.Item key={choiceIndex}>{choice.optionText}</List.Item>
                  ))}
                </List>
              )}
              {question.question_type === 'multiple_choice' && choices.length === 0 && (
                <Alert title="Warning" color="yellow" icon={<IconAlertCircle />}>
                  This multiple choice question has no choices defined.
                </Alert>
              )}
              {/* Add rendering for other question types if necessary */}
            </Stack>
          </Card>
        )
      })}
    </Stack>
  )
}
