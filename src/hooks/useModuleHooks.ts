import {
  addModuleSource,
  createModule,
  deleteModule,
  deleteModuleSource,
  getAllModules,
  getModule,
  getModuleStats,
  getModuleWithDetails,
  updateModule,
  updateModuleStats,
  type DbModule,
  type DbModuleSource,
  type DbModuleStats,
} from '@noggin/api/moduleApi'
import type { Json, TablesInsert } from '@noggin/types/database.types'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moduleKeys } from './query-keys'

// TODO This needs to be removed in favor of robust, zod-based UI types.
// This is basically just the module type the ui expects. I hate this.
export type ModuleWithDetails = {
  module: DbModule
  stats: DbModuleStats
  sources: DbModuleSource[]
}

/**
 * Query options for fetching a module with its stats and sources.
 * Suitable for use with loaders or useQuery.
 * @param moduleId The ID of the module.
 */
// TODO this should just be `useModule`.
export const moduleDetailsQueryOptions = (moduleId: string) =>
  queryOptions<ModuleWithDetails | null, Error>({
    queryKey: moduleKeys.detailWithDetails(moduleId),
    queryFn: () => getModuleWithDetails(moduleId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!moduleId, // Ensure moduleId is provided
  })

/**
 * Query options for fetching all modules for the current user.
 * Suitable for use with loaders or useQuery.
 */
export const allModulesQueryOptions = () =>
  queryOptions<DbModule[], Error>({
    queryKey: moduleKeys.list,
    queryFn: getAllModules,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

/**
 * Hook to fetch all modules for the current user.
 */
export const useAllModules = () => {
  // Use the shared queryOptions function
  return useQuery(allModulesQueryOptions())
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
  // Use the shared queryOptions function
  return useQuery(moduleDetailsQueryOptions(moduleId!))
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
    enabled: !!moduleId,
  })
}

/**
 * Hook to create a new module.
 */
export const useCreateModule = () => {
  const queryClient = useQueryClient()
  type CreateModuleInput = {
    title: string
    overview: string
  }

  return useMutation<DbModule | null, Error, CreateModuleInput>({
    mutationFn: (vars) => createModule(vars.title, vars.overview),
    onSuccess: (newModule) => {
      if (newModule) {
        // Invalidate the general module list query
        queryClient.invalidateQueries({ queryKey: moduleKeys.list })
        // Pre-populate the detail cache
        queryClient.setQueryData(moduleKeys.detail(newModule.id), newModule)

        // Define default stats based on the actual DbModuleStats type
        const defaultStats: DbModuleStats = {
          module_id: newModule.id,
          user_id: newModule.user_id,
          current_box: 1,
          last_reviewed_at: null,
          next_review_at: null,
          quiz_attempts: 0,
          review_count: 0,
        }

        // Pre-populate the detailWithDetails cache using the new options function
        queryClient.setQueryData(moduleDetailsQueryOptions(newModule.id).queryKey, {
          module: newModule,
          stats: defaultStats, // Use the correctly typed default stats
          sources: [], // Assuming new modules start with no sources
        })
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
    updates: Partial<Pick<DbModule, 'title' | 'overview'>>
  }
  type UpdateModuleContext = {
    previousModule: DbModule | undefined
    previousModuleWithDetails: ModuleWithDetails | undefined
    moduleId: string
  }

  return useMutation<DbModule | null, Error, UpdateModuleInput, UpdateModuleContext>({
    mutationFn: (vars) => updateModule(vars.moduleId, vars.updates),
    onMutate: async ({ moduleId, updates }) => {
      // Cancel outgoing refetches for detail and detailWithDetails
      await queryClient.cancelQueries({ queryKey: moduleKeys.detail(moduleId) })
      await queryClient.cancelQueries({ queryKey: moduleDetailsQueryOptions(moduleId).queryKey })

      // Snapshot previous values
      const previousModule = queryClient.getQueryData<DbModule>(moduleKeys.detail(moduleId))
      const previousModuleWithDetails = queryClient.getQueryData<ModuleWithDetails>(
        moduleDetailsQueryOptions(moduleId).queryKey
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
        queryClient.setQueryData<ModuleWithDetails>(moduleDetailsQueryOptions(moduleId).queryKey, {
          ...previousModuleWithDetails,
          module: {
            ...previousModuleWithDetails.module,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        })
      }

      return { previousModule, previousModuleWithDetails, moduleId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating module ${variables.moduleId}:`, err)
      // Rollback on error
      if (context?.previousModule) {
        queryClient.setQueryData(moduleKeys.detail(context.moduleId), context.previousModule)
      }
      if (context?.previousModuleWithDetails) {
        queryClient.setQueryData(
          moduleDetailsQueryOptions(context.moduleId).queryKey, // Use options queryKey
          context.previousModuleWithDetails
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
      queryClient.invalidateQueries({
        queryKey: moduleDetailsQueryOptions(variables.moduleId).queryKey,
      })
      // Invalidate the general module list
      queryClient.invalidateQueries({ queryKey: moduleKeys.list })
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
  }

  return useMutation<boolean, Error, DeleteModuleInput>({
    mutationFn: (vars) => deleteModule(vars.moduleId),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate the general module list query
        queryClient.invalidateQueries({ queryKey: moduleKeys.list })
        // Remove detail queries from cache
        queryClient.removeQueries({ queryKey: moduleKeys.detail(variables.moduleId), exact: true })
        queryClient.removeQueries({
          queryKey: moduleDetailsQueryOptions(variables.moduleId).queryKey,
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
        queryKey: moduleDetailsQueryOptions(variables.moduleId).queryKey,
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
    moduleId: string
  }

  return useMutation<boolean, Error, DeleteSourceInput>({
    mutationFn: (vars) => deleteModuleSource(vars.sourceId),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate queries that include sources
        queryClient.invalidateQueries({
          queryKey: moduleDetailsQueryOptions(variables.moduleId).queryKey,
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
        queryKey: moduleDetailsQueryOptions(variables.moduleId).queryKey,
      })
    },
    onError: (error, variables) => {
      console.error(`Error updating stats for module ${variables.moduleId}:`, error)
    },
  })
}
