// src/renderer/src/hooks/useModuleHooks.ts
import {
  addModuleSource,
  createModule,
  deleteModule,
  deleteModuleSource,
  getModule,
  getModulesByLibrary,
  getModuleStats,
  getModuleWithDetails,
  updateModule,
  updateModuleStats,
  type DbModule,
  type DbModuleSource,
  type DbModuleStats,
} from '@noggin/api/moduleApi'
import type { Json, TablesInsert } from '@noggin/types/database.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moduleKeys } from './query-keys'

// Type for the detailed module data
export type ModuleWithDetails = {
  // <--- Added export
  module: DbModule
  stats: DbModuleStats
  sources: DbModuleSource[]
}

/**
 * Hook to fetch modules by library ID.
 * @param libraryId The ID of the library.
 */
export const useModulesByLibrary = (libraryId: string | null | undefined) => {
  return useQuery<DbModule[], Error>({
    queryKey: moduleKeys.list(libraryId!),
    queryFn: () => getModulesByLibrary(libraryId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!libraryId, // Only run if libraryId is provided
  })
}

/**
 * Hook to fetch a single module by its ID.
 * @param moduleId The ID of the module.
 */
export const useModule = (moduleId: string | null | undefined) => {
  return useQuery<DbModule | null, Error>({
    queryKey: moduleKeys.detail(moduleId!),
    queryFn: () => getModule(moduleId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!moduleId, // Only run if moduleId is provided
  })
}

/**
 * Hook to fetch a module with its stats and sources.
 * @param moduleId The ID of the module.
 */
export const useModuleWithDetails = (moduleId: string | null | undefined) => {
  return useQuery<ModuleWithDetails | null, Error>({
    queryKey: moduleKeys.detailWithDetails(moduleId!),
    queryFn: () => getModuleWithDetails(moduleId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!moduleId, // Only run if moduleId is provided
  })
}

/**
 * Hook to fetch stats for a single module.
 * @param moduleId The ID of the module.
 */
export const useModuleStats = (moduleId: string | null | undefined) => {
  return useQuery<DbModuleStats | null, Error>({
    queryKey: moduleKeys.stats(moduleId!),
    queryFn: () => getModuleStats(moduleId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!moduleId, // Only run if moduleId is provided
  })
}

/**
 * Hook to create a new module.
 */
export const useCreateModule = () => {
  const queryClient = useQueryClient()
  type CreateModuleInput = {
    libraryId: string
    title: string
    overview: string
    lessonContent: Json
  }

  return useMutation<DbModule | null, Error, CreateModuleInput>({
    mutationFn: (vars) =>
      createModule(vars.libraryId, vars.title, vars.overview, vars.lessonContent),
    onSuccess: (newModule, variables) => {
      if (newModule) {
        // Invalidate the list query for the specific library
        queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.libraryId) })
        // Optionally pre-populate the detail cache
        queryClient.setQueryData(moduleKeys.detail(newModule.id), newModule)
      }
    },
    onError: (error) => {
      console.error('Error creating module:', error)
    },
  })
}

/**
 * Hook to update an existing module. Includes optimistic updates.
 */
export const useUpdateModule = () => {
  const queryClient = useQueryClient()
  type UpdateModuleInput = {
    moduleId: string
    libraryId: string // Needed for list invalidation
    updates: Partial<Pick<DbModule, 'title' | 'overview' | 'lesson_content'>>
  }
  type UpdateModuleContext = {
    previousModule: DbModule | undefined
    previousModuleWithDetails: ModuleWithDetails | undefined
    moduleId: string
    libraryId: string
  }

  return useMutation<DbModule | null, Error, UpdateModuleInput, UpdateModuleContext>({
    mutationFn: (vars) => updateModule(vars.moduleId, vars.updates),
    onMutate: async ({ moduleId, libraryId, updates }) => {
      // Cancel outgoing refetches for detail and detailWithDetails
      await queryClient.cancelQueries({ queryKey: moduleKeys.detail(moduleId) })
      await queryClient.cancelQueries({ queryKey: moduleKeys.detailWithDetails(moduleId) })

      // Snapshot previous values
      const previousModule = queryClient.getQueryData<DbModule>(moduleKeys.detail(moduleId))
      const previousModuleWithDetails = queryClient.getQueryData<ModuleWithDetails>(
        moduleKeys.detailWithDetails(moduleId)
      )

      // Optimistically update the detail cache
      if (previousModule) {
        queryClient.setQueryData<DbModule>(moduleKeys.detail(moduleId), {
          ...previousModule,
          ...updates,
          updated_at: new Date().toISOString(), // Optimistically update timestamp
        })
      }
      // Optimistically update the detailWithDetails cache
      if (previousModuleWithDetails) {
        queryClient.setQueryData<ModuleWithDetails>(moduleKeys.detailWithDetails(moduleId), {
          ...previousModuleWithDetails,
          module: {
            ...previousModuleWithDetails.module,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        })
      }

      return { previousModule, previousModuleWithDetails, moduleId, libraryId } // Return context
    },
    onError: (err, variables, context) => {
      console.error(`Error updating module ${variables.moduleId}:`, err)
      // Rollback on error
      if (context?.previousModule) {
        queryClient.setQueryData(moduleKeys.detail(context.moduleId), context.previousModule)
      }
      if (context?.previousModuleWithDetails) {
        queryClient.setQueryData(
          moduleKeys.detailWithDetails(context.moduleId),
          context.previousModuleWithDetails
        )
      }
    },
    onSettled: (_data, _error, variables, context) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
      queryClient.invalidateQueries({ queryKey: moduleKeys.detailWithDetails(variables.moduleId) })
      // Invalidate the list for the library the module belongs to
      if (context?.libraryId) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.list(context.libraryId) })
      } else {
        // Fallback if libraryId wasn't in context (should be)
        queryClient.invalidateQueries({ queryKey: moduleKeys.all }) // Less specific
      }
    },
  })
}

/**
 * Hook to delete a module.
 */
export const useDeleteModule = () => {
  const queryClient = useQueryClient()
  type DeleteModuleInput = {
    moduleId: string
    libraryId: string // Needed for list invalidation
  }

  return useMutation<boolean, Error, DeleteModuleInput>({
    mutationFn: (vars) => deleteModule(vars.moduleId),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate the list query for the specific library
        queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.libraryId) })
        // Remove detail queries from cache
        queryClient.removeQueries({ queryKey: moduleKeys.detail(variables.moduleId), exact: true })
        queryClient.removeQueries({
          queryKey: moduleKeys.detailWithDetails(variables.moduleId),
          exact: true,
        })
        queryClient.removeQueries({ queryKey: moduleKeys.stats(variables.moduleId), exact: true })
        queryClient.removeQueries({ queryKey: moduleKeys.sources(variables.moduleId), exact: true })
      } else {
        console.error(`Failed to delete module ${variables.moduleId}, API returned false.`)
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting module ${variables.moduleId}:`, error)
      // Consider invalidating relevant queries on error if optimistic updates were used elsewhere
      // queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.libraryId) });
    },
  })
}

/**
 * Hook to add a source to a module.
 */
export const useAddModuleSource = () => {
  const queryClient = useQueryClient()
  type AddSourceInput = {
    moduleId: string
    sourceData: Pick<
      TablesInsert<'module_sources'>,
      'file_name' | 'storage_object_path' | 'mime_type' | 'size_bytes'
    >
  }

  return useMutation<DbModuleSource | null, Error, AddSourceInput>({
    mutationFn: (vars) => addModuleSource(vars.moduleId, vars.sourceData),
    onSuccess: (_newSource, variables) => {
      // Invalidate queries that include sources
      queryClient.invalidateQueries({
        queryKey: moduleKeys.detailWithDetails(variables.moduleId),
      })
      queryClient.invalidateQueries({ queryKey: moduleKeys.sources(variables.moduleId) })
    },
    onError: (error, variables) => {
      console.error(`Error adding source to module ${variables.moduleId}:`, error)
    },
  })
}

/**
 * Hook to delete a module source.
 */
export const useDeleteModuleSource = () => {
  const queryClient = useQueryClient()
  type DeleteSourceInput = {
    sourceId: string
    moduleId: string // Needed for invalidation
  }

  return useMutation<boolean, Error, DeleteSourceInput>({
    mutationFn: (vars) => deleteModuleSource(vars.sourceId),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate queries that include sources
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detailWithDetails(variables.moduleId),
        })
        queryClient.invalidateQueries({ queryKey: moduleKeys.sources(variables.moduleId) })
      } else {
        console.error(`Failed to delete module source ${variables.sourceId}.`)
      }
    },
    onError: (error, variables) => {
      console.error(`Error deleting module source ${variables.sourceId}:`, error)
    },
  })
}

/**
 * Hook to update module statistics.
 */
export const useUpdateModuleStats = () => {
  const queryClient = useQueryClient()
  type UpdateStatsInput = {
    moduleId: string
    statsUpdate: Partial<Omit<DbModuleStats, 'module_id' | 'user_id'>>
  }

  return useMutation<DbModuleStats | null, Error, UpdateStatsInput>({
    mutationFn: (vars) => updateModuleStats(vars.moduleId, vars.statsUpdate),
    onSuccess: (_updatedStats, variables) => {
      // Invalidate stats and detailWithDetails queries
      queryClient.invalidateQueries({ queryKey: moduleKeys.stats(variables.moduleId) })
      queryClient.invalidateQueries({
        queryKey: moduleKeys.detailWithDetails(variables.moduleId),
      })
    },
    onError: (error, variables) => {
      console.error(`Error updating stats for module ${variables.moduleId}:`, error)
    },
  })
}
