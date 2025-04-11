import { Button, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useCreateLibrary } from '@noggin/hooks/useLibraryHooks'
import type { Tables } from '@noggin/types/database.types'
import { z } from 'zod'

// Define DbLibrary type locally using Tables helper
type DbLibrary = Tables<'libraries'>

// Define a simpler form schema without path
const libraryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

// Define form values type based on schema
type LibraryFormValues = z.infer<typeof libraryFormSchema>

interface CreateLibraryModalProps {
  opened: boolean
  onClose: () => void
  onCreated: (libraryId: string) => void
}

export function CreateLibraryModal({ opened, onClose, onCreated }: CreateLibraryModalProps) {
  // Removed: const saveLibraryMutation = useSaveLibrary();
  const createLibraryMutation = useCreateLibrary() // Use the new hook

  const form = useForm<LibraryFormValues>({
    initialValues: {
      name: '',
      description: '',
      // Removed: path: '',
    },
    // Use zodResolver with the new schema
    validate: (values) => {
      const result = libraryFormSchema.safeParse(values)
      if (!result.success) {
        return result.error.formErrors.fieldErrors
      }
      return {}
    },
  })

  const handleSubmit = async (values: LibraryFormValues) => {
    // Removed: const newLibrary: Library = createLibrary(values.path, values.name, values.description);

    createLibraryMutation.mutate(
      { name: values.name, description: values.description || '' }, // Pass only name and description
      {
        onSuccess: (newLibrary: DbLibrary) => {
          // Use DbLibrary type for result
          notifications.show({
            title: 'Library Created',
            message: `Library "${values.name}" has been created successfully`,
            color: 'green',
          })
          onCreated(newLibrary.id) // Pass the ID from the mutation result
          onClose()
          form.reset()
        },
        onError: (error: Error) => {
          // Use Error type
          notifications.show({
            title: 'Creation Failed',
            message: error.message || 'Failed to create library',
            color: 'red',
          })
        },
      }
    )
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Library">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Library Name"
            placeholder="My Learning Library"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="A brief description of this library"
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createLibraryMutation.isPending}>
              Create Library
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
