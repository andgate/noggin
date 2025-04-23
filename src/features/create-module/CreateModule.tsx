import { useAuth } from '@/app/auth/auth.hooks'
import { useAddModuleSource, useCreateModule } from '@/core/hooks/useModuleHooks'
import { useUploadModuleSource } from '@/core/hooks/useStorageHooks'
import type { Module } from '@/core/types/module.types'
import {
  Alert,
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
import { IconAlertCircle } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { SourceSelectionView } from './components/SourceSelectionView'
import type { GeneratedContentAnalysis } from './types/generated-analysis.types'

type WizardStep = 'select' | 'generate' | 'review'

// Update type to use AnalyzedContent and store original files separately
type ReviewData = GeneratedContentAnalysis & {
  originalFiles: File[] // Keep track of the files used for analysis
}

export function ProcessingView() {
  return (
    <Stack align="center" gap="md" py="xl" style={{ flex: 1 }}>
      {/* Use LoadingOverlay directly instead of wrapping */}
      <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
      <Text>Analyzing content...</Text>
    </Stack>
  )
}

interface ReviewViewProps {
  data: ReviewData // Use updated type
  onDataChange: (updates: Partial<GeneratedContentAnalysis>) => void
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
        disabled={isSaving}
      />
      <Textarea
        label="Overview"
        value={data.overview}
        onChange={(e) => onDataChange({ overview: e.target.value })}
        minRows={3}
        autosize
        maxRows={10}
        required
        disabled={isSaving}
      />
      <Text size="sm" c="dimmed">
        Module slug (auto-generated): {data.slug}
      </Text>

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button
          onClick={onSave}
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
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false) // Local state for AI generation
  const [aiError, setAiError] = useState<string | null>(null) // Local state for AI errors

  // --- API Mutations ---
  const createModuleMutation = useCreateModule()
  const uploadModuleSourceMutation = useUploadModuleSource()
  const addModuleSourceMutation = useAddModuleSource()

  // Combined saving state
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

    setIsGenerating(true) // Start AI loading state
    setAiError(null) // Clear previous errors
    setStep('generate') // Show processing view

    try {
      const fileContents = await Promise.all(files.map(readFileAsText))
      // Call the AI service directly
      const analysisResult = await aiService.analyzeContent({ fileContents })

      const data: ReviewData = {
        ...analysisResult,
        originalFiles: files, // Store the original files alongside analysis
      }

      setReviewData(data)
      setStep('review')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze content'
      console.error('AI Analysis Error:', error)
      setAiError(errorMessage) // Store error message
      notifications.show({
        title: 'Analysis Failed',
        message: errorMessage,
        color: 'red',
        autoClose: 8000,
      })
      setStep('select') // Go back to selection on error
    } finally {
      setIsGenerating(false) // Stop AI loading state regardless of outcome
    }
  }, [files]) // Dependency on files

  const handleClose = useCallback(() => {
    // Navigate back or to dashboard
    if (window.history.length > 1) {
      navigate({ to: '..' }) // Go back if possible
    } else {
      navigate({ to: '/' }) // Fallback to dashboard
    }
  }, [navigate])

  const handleSave = useCallback(async () => {
    if (!reviewData) {
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

    let newModule: Module | null = null // Expect Module type from hook

    try {
      // 1. Create Module record in DB using the hook
      newModule = await createModuleMutation.mutateAsync({
        title: reviewData.title,
        overview: reviewData.overview,
        // slug is not part of the module table schema directly
      })

      if (!newModule) {
        throw new Error('Module creation returned null unexpectedly.')
      }
      const currentModuleId = newModule.id

      // 2. Upload Sources and Create Source Records
      const sourceUploadPromises = reviewData.originalFiles.map(async (file) => {
        try {
          // Upload file using the hook
          const uploadResult = await uploadModuleSourceMutation.mutateAsync({
            userId: userId,
            moduleId: currentModuleId,
            file: file,
          })

          if (!uploadResult.path) {
            throw new Error(`Storage upload failed for ${file.name}, path is null.`)
          }

          // Add source record using the hook
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
          // Log detailed error but throw a more user-friendly one if needed
          console.error(`Failed to process source file "${file.name}":`, sourceError)
          throw new Error(`Failed to process source file "${file.name}".`)
        }
      })

      await Promise.all(sourceUploadPromises)

      // 3. Final Success Notification and Navigation
      notifications.show({
        title: 'Module Created',
        message: `Module "${reviewData.title}" saved successfully.`,
        color: 'green',
      })
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
      // Optional: Add cleanup logic here if module was created but sources failed
      // if (newModule?.id) { /* attempt to delete module? */ }
    }
    // No finally block needed here as isSaving covers mutation states
  }, [
    reviewData,
    userId,
    createModuleMutation,
    uploadModuleSourceMutation,
    addModuleSourceMutation,
    navigate,
  ])

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleDataChange = (updates: Partial<GeneratedContentAnalysis>) => {
    setReviewData((prev) => (prev ? { ...prev, ...updates } : null))
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

  // Determine overall loading state
  const isLoading = isGenerating || isSaving

  return (
    <Stack h="100vh">
      <Group px="md" py="xs" justify="space-between" bg="var(--mantine-color-dark-6)">
        <Title order={4}>Create New Module</Title>
        <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
          Back
        </Button>
      </Group>

      <Stack p="md" style={{ flex: 1, position: 'relative' }}>
        {/* Show overlay only during DB saving, AI processing has its own view */}
        <LoadingOverlay visible={isSaving} overlayProps={{ blur: 2 }} />

        {step === 'select' && (
          <SourceSelectionView
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onGenerate={handleGenerate}
            onClose={handleClose}
            isLoading={isGenerating} // Pass AI generating state
          />
        )}
        {step === 'generate' && <ProcessingView />}
        {step === 'review' && reviewData && (
          <ReviewView
            data={reviewData}
            onDataChange={handleDataChange}
            onBack={() => setStep('select')}
            onSave={handleSave}
            isSaving={isSaving} // Pass DB saving state
          />
        )}
        {/* Display AI errors if they occur */}
        {aiError && step === 'select' && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Analysis Error"
            color="red"
            withCloseButton
            onClose={() => setAiError(null)}
            mt="md"
          >
            {aiError}
          </Alert>
        )}
      </Stack>
    </Stack>
  )
}
