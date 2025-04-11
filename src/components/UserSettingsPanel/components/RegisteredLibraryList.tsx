import { Button, Group, Loader, Modal, Paper, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useCreateLibrary, useDeleteLibrary, useLibraries } from '@noggin/hooks/useLibraryHooks'
import type { Tables } from '@noggin/types/database.types'
import { IconTrash } from '@tabler/icons-react'
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

export function RegisteredLibraryList() {
  const { data: libraries = [], isLoading } = useLibraries() // Use new hook
  const createLibraryMutation = useCreateLibrary() // Use new hook
  const deleteLibraryMutation = useDeleteLibrary() // Use new hook
  const [opened, { open, close }] = useDisclosure(false)

  const form = useForm<LibraryFormValues>({
    initialValues: {
      name: '',
      description: '',
      // Removed: path: '',
    },
    validate: (values) => {
      const result = libraryFormSchema.safeParse(values)
      if (!result.success) {
        // Convert Zod errors to Mantine form errors
        return result.error.formErrors.fieldErrors
      }
      return {}
    },
  })

  const handleCreateLibrary = (values: LibraryFormValues) => {
    // Removed: const newLibrary: Library = createLibrary(values.path, values.name, values.description);

    createLibraryMutation.mutate(
      { name: values.name, description: values.description || '' }, // Pass only name and description
      {
        onSuccess: () => {
          notifications.show({
            title: 'Library Added',
            message: `Library "${values.name}" has been added successfully`,
            color: 'green',
          })
          form.reset()
          close()
        },
        onError: (error: Error) => {
          // Use Error type
          notifications.show({
            title: 'Failed to Add Library',
            message: error.message || 'An unknown error occurred',
            color: 'red',
          })
        },
      }
    )
  }

  const handleRemoveLibrary = (libraryId: string) => {
    deleteLibraryMutation.mutate(libraryId, {
      onSuccess: () => {
        notifications.show({
          title: 'Library Removed',
          color: 'blue',
          message: 'Library removed successfully',
        })
      },
      onError: (error: Error) => {
        // Use Error type
        notifications.show({
          title: 'Failed to Remove Library',
          color: 'red',
          message: error.message || 'An unknown error occurred',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Stack align="center" py="md">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading libraries...
        </Text>
      </Stack>
    )
  }

  return (
    <Stack>
      <Text fw={500} size="sm">
        Registered Libraries
      </Text>

      {libraries.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No libraries registered yet
        </Text>
      ) : (
        libraries.map((library: DbLibrary) => (
          <Paper key={library.id} withBorder p="xs">
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm" fw={500}>
                  {library.name}
                </Text>
                {/* Display description instead of path */}
                <Text size="xs" c="dimmed">
                  {library.description || 'No description'}
                </Text>
                {/* Removed: library.path */}
              </Stack>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => handleRemoveLibrary(library.id)}
                loading={
                  deleteLibraryMutation.isPending && deleteLibraryMutation.variables === library.id
                }
                leftSection={<IconTrash size={16} />}
              >
                Remove
              </Button>
            </Group>
          </Paper>
        ))
      )}

      <Button onClick={open}>Add Library</Button>

      <Modal opened={opened} onClose={close} title="Create New Library">
        <form onSubmit={form.onSubmit(handleCreateLibrary)}>
          <Stack>
            <TextInput
              label="Library Name"
              placeholder="Enter library name"
              required
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Description"
              placeholder="Enter library description (optional)"
              {...form.getInputProps('description')}
            />

            {/* Removed DirectoryPicker and path logic */}
            {/* Removed: <Text size="sm" fw={500}>Select Library Location</Text> */}
            {/* Removed: <DirectoryPicker onSelect={(path) => form.setFieldValue('path', path)} /> */}
            {/* Removed: form.errors.path handling */}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={createLibraryMutation.isPending}>
                Create Library
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
