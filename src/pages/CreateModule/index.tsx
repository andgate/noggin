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
import { useLibraries } from '@noggin/hooks/useLibraryHooks'
import { useAddModuleSource, useCreateModule } from '@noggin/hooks/useModuleHooks'
import { useUploadModuleSource } from '@noggin/hooks/useStorageHooks'
import type { Tables } from '@noggin/types/database.types'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { LibrarySelector } from './components/LibrarySelector'
import { SourceSelectionView } from './components/SourceSelectionView'

// DB Types
type DbModule = Tables<'modules'>
type DbLibrary = Tables<'libraries'> // Added for type safety

type WizardStep = 'select' | 'generate' | 'review'
// This type now holds the analysis result and the original File objects
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
  onSave: (selectedLibraryId: string | null) => void
  isSaving: boolean
}

export function ReviewView({ data, onDataChange, onBack, onSave, isSaving }: ReviewViewProps) {
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)

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

      <LibrarySelector
        onSelect={setSelectedLibraryId}
        selectedId={selectedLibraryId || undefined}
        // Removed required prop as validation is handled in onSave
      />

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button
          onClick={() => onSave(selectedLibraryId)}
          disabled={!selectedLibraryId || !data.title || !data.overview || isSaving}
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
  const [files, setFiles] = useState<File[]>([]) // Use standard File objects
  const [generatedData, setGeneratedData] = useState<GeneratedModuleData | null>(null)
  const { data: allLibraries } = useLibraries() // Corrected hook usage

  // --- Mutations ---
  // Use the renamed hook and variable
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

    console.log(
      '📋 handleGenerate called with files:',
      files.map((f) => f.name)
    )
    setStep('generate') // Show processing view immediately

    try {
      // Read file contents before calling the mutation
      const fileContents = await Promise.all(files.map(readFileAsText))
      console.log('📋 Read file contents successfully.')

      console.log('📋 About to call generateModule mutation')
      // Call the renamed mutation
      const analysis = await generateModuleMutation.mutateAsync({ fileContents })
      console.log('📋 generateModule returned:', analysis)

      // Store analysis result along with the original File objects
      const data: GeneratedModuleData = {
        ...analysis,
        sources: files, // Keep the File objects for later upload
      }

      console.log('📋 Setting generatedData and moving to review step')
      setGeneratedData(data)
      setStep('review')
    } catch (error) {
      // Explicitly type error
      console.error('📋 Error in handleGenerate:', error)
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
      setStep('select') // Go back to selection on error
    }
  }, [files, generateModuleMutation])

  const handleClose = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  const handleSave = useCallback(
    async (selectedLibraryId: string | null) => {
      console.log('📋 handleSave called with Library ID:', selectedLibraryId)
      if (!generatedData) {
        console.error('📋 No generatedData available!')
        notifications.show({ title: 'Error', message: 'Module data is missing.', color: 'red' })
        return
      }
      if (!selectedLibraryId) {
        notifications.show({
          title: 'Library Required',
          message: 'Please select a library.',
          color: 'yellow',
        })
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

      // Add type annotation for lib
      const selectedLibrary = allLibraries?.find((lib: DbLibrary) => lib.id === selectedLibraryId)
      if (!selectedLibrary) {
        notifications.show({
          title: 'Error',
          message: `Could not find details for library: ${selectedLibraryId}`,
          color: 'red',
        })
        return
      }

      let newModule: DbModule | null = null // Keep track of the created module

      try {
        // 1. Create Module record in DB
        console.log('📋 Creating module in DB...')
        newModule = await createModuleMutation.mutateAsync({
          libraryId: selectedLibraryId, // Corrected property name
          title: generatedData.title,
          overview: generatedData.overview,
          lessonContent: null, // Add missing required property, set to null
          // user_id is set by RLS policy
        })
        console.log('📋 Module created successfully:', newModule)

        // Ensure newModule is not null before proceeding
        if (!newModule) {
          throw new Error('Module creation returned null unexpectedly.')
        }
        const currentModuleId = newModule.id // Store ID for use in loop

        // 2. Upload Sources and Create Source Records
        console.log('📋 Uploading sources and creating records...')
        const sourceUploadPromises = generatedData.sources.map(async (file) => {
          try {
            // 2a. Upload file to Storage
            console.log(`📤 Uploading file: ${file.name} for module ${currentModuleId}`)
            const uploadResult = await uploadModuleSourceMutation.mutateAsync({
              userId: userId,
              moduleId: currentModuleId, // Use stored ID
              file: file, // Pass the actual File object
            })
            console.log(`✅ File uploaded: ${file.name}, Path: ${uploadResult.path}`)

            // --- Add check for null path ---
            if (!uploadResult.path) {
              throw new Error(`Storage upload failed for ${file.name}, path is null.`)
            }
            // --- End check ---

            // 2b. Create module_sources record in DB
            console.log(`📝 Creating source record for: ${file.name}`)
            // Correct the structure and property names for AddSourceInput
            const newSource = await addModuleSourceMutation.mutateAsync({
              moduleId: currentModuleId,
              sourceData: {
                file_name: file.name,
                storage_object_path: uploadResult.path,
                mime_type: file.type || null,
                size_bytes: file.size,
              },
              // user_id is set by RLS policy
            })

            // Check if newSource is null
            if (!newSource) {
              throw new Error(`Source record creation returned null for ${file.name}`)
            }
            console.log(`✅ Source record created: ${newSource.id} for ${file.name}`)
            return newSource
          } catch (sourceError) {
            // Explicitly type error
            console.error(`❌ Error processing source ${file.name}:`, sourceError)
            const message = sourceError instanceof Error ? sourceError.message : 'Unknown error'
            throw new Error(`Failed to process source file "${file.name}": ${message}`)
          }
        })

        await Promise.all(sourceUploadPromises)
        console.log('✅ All sources processed successfully.')

        // 3. Final Success Notification and Navigation
        notifications.show({
          title: 'Module Created',
          message: `Module "${generatedData.title}" saved successfully.`,
          color: 'green',
        })
        handleClose()
      } catch (error) {
        // Explicitly type error
        console.error('❌ Error during module save process:', error)
        notifications.show({
          title: 'Save Failed',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred while saving the module.',
          color: 'red',
          autoClose: 8000,
        })
        // Potential cleanup: If module was created but sources failed, maybe delete the module?
        // if (newModule) { /* call deleteModule mutation */ }
      }
    },
    [
      handleClose,
      generatedData,
      userId,
      allLibraries,
      createModuleMutation,
      uploadModuleSourceMutation,
      addModuleSourceMutation,
    ]
  )

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // Update generated data (e.g., title/overview edits in ReviewView)
  const handleDataChange = (updates: Partial<GeneratedModuleData>) => {
    setGeneratedData((prev) => (prev ? { ...prev, ...updates } : null))
  }

  // Correctly handle FileWithPath[] from Mantine Dropzone
  const handleAddFiles = (newFiles: FileWithPath[]) => {
    // Filter out duplicates based on name and size (simple check)
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
        {/* Show loading overlay during AI analysis or saving */}
        <LoadingOverlay visible={isProcessing || isSaving} overlayProps={{ blur: 2 }} />

        {step === 'select' && (
          <SourceSelectionView
            files={files}
            onAddFiles={handleAddFiles} // Use the corrected handler
            onRemoveFile={handleRemoveFile}
            onGenerate={handleGenerate}
            onClose={handleClose}
            isLoading={isProcessing} // Use isProcessing state
          />
        )}
        {step === 'generate' && <ProcessingView />}
        {step === 'review' && generatedData && (
          <ReviewView
            data={generatedData}
            onDataChange={handleDataChange}
            onBack={() => setStep('select')}
            onSave={handleSave}
            isSaving={isSaving} // Pass saving state
          />
        )}
      </Stack>
    </Stack>
  )
}
