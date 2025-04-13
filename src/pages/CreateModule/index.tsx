import {
  Button,
  Group,
  LoadingOverlay,
  rem,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import type { FileWithPath } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { useAuth } from '@noggin/app/auth/AuthProvider'
import { useGenerateModule } from '@noggin/hooks/useAiHooks'
import { useAddModuleSource, useCreateModule } from '@noggin/hooks/useModuleHooks'
import { useUploadModuleSource } from '@noggin/hooks/useStorageHooks'
import type { Tables } from '@noggin/types/database.types'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { SourceSelectionView } from './components/SourceSelectionView'

// DB Types
type DbModule = Tables<'modules'>

type WizardStep = 'select' | 'generate' | 'review'
// This type holds the analysis result and the original File objects
type GeneratedModuleData = {
  title: string
  overview: string
  slug: string
  sources: File[]
}

export function ProcessingView() {
  return (
    <Stack align="center" gap="md" py="xl" style={{ flex: 1 }}>
      <LoadingOverlay visible={true} />
      <Text>Analyzing content...</Text>
    </Stack>
  )
}

interface ReviewViewProps {
  data: GeneratedModuleData
  onDataChange: (updates: Partial<GeneratedModuleData>) => void
  onBack: () => void
  onSave: () => void
  isSaving: boolean
}

export function ReviewView({ data, onDataChange, onBack, onSave, isSaving }: ReviewViewProps) {
  return (
    <Stack gap="md" style={{ maxWidth: rem(600), margin: '0 auto' }}>
      <TextInput
        label="Module Title"
        value={data.title}
        onChange={(e) => onDataChange({ title: e.target.value })}
        required
      />
      <Textarea
        label="Overview"
        value={data.overview}
        onChange={(e) => onDataChange({ overview: e.target.value })}
        minRows={3}
        autosize
        maxRows={10}
        required
      />
      <Text size="sm" c="dimmed">
        Module slug (auto-generated): {data.slug}
      </Text>

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button
          onClick={onSave} // Call onSave directly
          disabled={!data.title || !data.overview || isSaving}
          loading={isSaving}
        >
          Save Module
        </Button>
      </Group>
    </Stack>
  )
}

// Helper to read file content as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
    reader.readAsText(file)
  })
}

export function CreateModulePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [step, setStep] = useState<WizardStep>('select')
  const [files, setFiles] = useState<File[]>([])
  const [generatedData, setGeneratedData] = useState<GeneratedModuleData | null>(null)

  // --- Mutations ---
  const generateModuleMutation = useGenerateModule()
  const createModuleMutation = useCreateModule()
  const uploadModuleSourceMutation = useUploadModuleSource()
  const addModuleSourceMutation = useAddModuleSource()

  const isProcessing = generateModuleMutation.isPending
  const isSaving =
    createModuleMutation.isPending ||
    uploadModuleSourceMutation.isPending ||
    addModuleSourceMutation.isPending

  const handleGenerate = useCallback(async () => {
    if (files.length === 0) {
      notifications.show({
        title: 'No Files Selected',
        message: 'Please select or drop files to analyze.',
        color: 'yellow',
      })
      return
    }

    setStep('generate')

    try {
      const fileContents = await Promise.all(files.map(readFileAsText))
      const analysis = await generateModuleMutation.mutateAsync({ fileContents })

      const data: GeneratedModuleData = {
        ...analysis,
        sources: files,
      }

      setGeneratedData(data)
      setStep('review')
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to analyze content'
      let errorTitle = 'Analysis Failed'

      if (errorMessage.includes('API key')) {
        errorTitle = 'API Key Issue'
        errorMessage = `${errorMessage}. Please check your API key in Settings.`
      } else if (errorMessage.includes('timed out') || errorMessage.includes('deadline')) {
        errorTitle = 'Request Timed Out'
        errorMessage = 'The AI request took too long. Check connection or try smaller files.'
      }

      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: 'red',
        autoClose: 8000,
      })
      setStep('select')
    }
  }, [files, generateModuleMutation])

  const handleClose = useCallback(() => {
    navigate({ to: '/' }) // TODO - User router history to go back to previous page
  }, [navigate])

  const handleSave = useCallback(async () => {
    if (!generatedData) {
      notifications.show({ title: 'Error', message: 'Module data is missing.', color: 'red' })
      return
    }
    if (!userId) {
      notifications.show({
        title: 'Authentication Error',
        message: 'User not found. Please log in again.',
        color: 'red',
      })
      return
    }

    let newModule: DbModule | null = null

    try {
      // 1. Create Module record in DB
      newModule = await createModuleMutation.mutateAsync({
        title: generatedData.title,
        overview: generatedData.overview,
      })

      if (!newModule) {
        throw new Error('Module creation returned null unexpectedly.')
      }
      const currentModuleId = newModule.id

      // 2. Upload Sources and Create Source Records
      const sourceUploadPromises = generatedData.sources.map(async (file) => {
        try {
          const uploadResult = await uploadModuleSourceMutation.mutateAsync({
            userId: userId,
            moduleId: currentModuleId,
            file: file,
          })

          if (!uploadResult.path) {
            throw new Error(`Storage upload failed for ${file.name}, path is null.`)
          }

          const newSource = await addModuleSourceMutation.mutateAsync({
            moduleId: currentModuleId,
            sourceData: {
              file_name: file.name,
              storage_object_path: uploadResult.path,
              mime_type: file.type || null,
              size_bytes: file.size,
            },
          })

          if (!newSource) {
            throw new Error(`Source record creation returned null for ${file.name}`)
          }
          return newSource
        } catch (sourceError) {
          const message = sourceError instanceof Error ? sourceError.message : 'Unknown error'
          throw new Error(`Failed to process source file "${file.name}": ${message}`)
        }
      })

      await Promise.all(sourceUploadPromises)

      // 3. Final Success Notification and Navigation
      notifications.show({
        title: 'Module Created',
        message: `Module "${generatedData.title}" saved successfully.`,
        color: 'green',
      })
      // Navigate to the new module's page
      navigate({ to: '/module/view/$moduleId', params: { moduleId: newModule.id } })
    } catch (error) {
      notifications.show({
        title: 'Save Failed',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while saving the module.',
        color: 'red',
        autoClose: 8000,
      })
      // TODO Consider cleanup if needed
    }
  }, [
    generatedData,
    userId,
    createModuleMutation,
    uploadModuleSourceMutation,
    addModuleSourceMutation,
    navigate,
  ])

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleDataChange = (updates: Partial<GeneratedModuleData>) => {
    setGeneratedData((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const handleAddFiles = (newFiles: FileWithPath[]) => {
    const uniqueNewFiles = newFiles.filter(
      (newFile) =>
        !files.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        )
    )
    setFiles((prev) => [...prev, ...uniqueNewFiles])
  }

  return (
    <Stack h="100vh">
      <Group px="md" py="xs" justify="space-between" bg="var(--mantine-color-dark-6)">
        <Title order={4}>Create New Module</Title>
        <Button variant="subtle" onClick={handleClose} disabled={isProcessing || isSaving}>
          Back to Dashboard
        </Button>
      </Group>

      <Stack p="md" style={{ flex: 1, position: 'relative' }}>
        <LoadingOverlay visible={isProcessing || isSaving} overlayProps={{ blur: 2 }} />

        {step === 'select' && (
          <SourceSelectionView
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onGenerate={handleGenerate}
            onClose={handleClose}
            isLoading={isProcessing}
          />
        )}
        {step === 'generate' && <ProcessingView />}
        {step === 'review' && generatedData && (
          <ReviewView
            data={generatedData}
            onDataChange={handleDataChange}
            onBack={() => setStep('select')}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
      </Stack>
    </Stack>
  )
}
