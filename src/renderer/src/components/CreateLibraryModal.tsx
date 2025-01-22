import { Button, Group, Modal, Stack, Text, TextInput, Textarea } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { slugify } from '@noggin/common/slug'
import { LibraryForm, libraryFormSchema } from '@noggin/types/library-types'
import { useLibrary } from '@renderer/app/hooks/use-library'
import { DirectoryPicker } from './DirectoryPicker'

interface CreateLibraryModalProps {
    opened: boolean
    onClose: () => void
    onCreated: (libraryPath: string) => void
}

export function CreateLibraryModal({ opened, onClose, onCreated }: CreateLibraryModalProps) {
    const { createLibrary } = useLibrary()

    const form = useForm<LibraryForm>({
        initialValues: {
            name: '',
            description: '',
            path: '',
        },
        validate: zodResolver(libraryFormSchema),
    })

    const handleSubmit = async (values: LibraryForm) => {
        try {
            await createLibrary(values.path, {
                name: values.name,
                description: values.description,
                createdAt: Date.now(),
                slug: slugify(values.name),
            })
            notifications.show({
                title: 'Library Created',
                message: `Library "${values.name}" has been created successfully`,
                color: 'green',
            })
            onCreated(values.path)
            onClose()
        } catch (error: any) {
            notifications.show({
                title: 'Creation Failed',
                message: error.message || 'Failed to create library',
                color: 'red',
            })
        }
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

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>
                            Library Location
                        </Text>
                        <DirectoryPicker onSelect={(path) => form.setFieldValue('path', path)} />
                        {form.values.path && (
                            <Text size="sm" c="dimmed">
                                Selected: {form.values.path}
                            </Text>
                        )}
                    </Stack>

                    <Group justify="flex-end" mt="xl">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Library</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
