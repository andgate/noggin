import {
  addModuleSource,
  createModule,
  deleteModule,
  deleteModuleSource,
  getModule,
  getModuleList,
  getModuleStats,
  updateModule,
  updateModuleStats,
} from '@/core/api/moduleApi'
import { ModuleListItem } from '@/core/types/module-list-item.types'
import { ModuleSource } from '@/core/types/module-source.types'
import { ModuleStats } from '@/core/types/module-stats.types'
import { Module } from '@/core/types/module.types'
import type { TablesInsert, TablesUpdate } from '@/shared/types/database.types' // Import TablesUpdate
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moduleKeys } from './query-keys'

// --- Exported Hook Input/Context Types ---

export type CreateModuleHookInput = {
  title: string
  overview: string
}

export type UpdateModuleHookInput = {
  moduleId: string
  updates: Partial<Pick<Module, 'title' | 'overview'>>
}

export type UpdateModuleHookContext = {
  previousModule: Module | undefined
  moduleId: string
}

export type DeleteModuleHookInput = {
  moduleId: string
}

export type AddSourceHookInput = {
  moduleId: string
  sourceData: Pick<
    TablesInsert<'module_sources'>,
    'file_name' | 'storage_object_path' | 'mime_type' | 'size_bytes'
  >
}

export type DeleteSourceHookInput = {
  sourceId: string
  moduleId: string
}

export type UpdateStatsHookInput = {
  moduleId: string
  statsUpdate: Partial<Omit<ModuleStats, 'moduleId' | 'userId'>>
}

// Internal type for mapping in useUpdateModuleStats mutationFn
type DbStatsUpdate = Partial<Omit<TablesUpdate<'module_stats'>, 'module_id' | 'user_id'>>

// --- Query Options ---

/**
 * Query options for fetching detailed module information (Module view type).
 * Suitable for use with loaders or useQuery.
 * @param moduleId The ID of the module.
 */
export const moduleQueryOptions = (moduleId: string) =>
  queryOptions<Module | null, Error>({
    queryKey: moduleKeys.detail(moduleId),
    queryFn: () => getModule(moduleId),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })

/**
 * Query options for fetching the list of all modules (ModuleListItem view type).
 * Suitable for use with loaders or useQuery.
 */
export const allModulesQueryOptions = () =>
  queryOptions<ModuleListItem[], Error>({
    queryKey: moduleKeys.list,
    queryFn: getModuleList,
    staleTime: 1000 * 60 * 5,
  })

// --- Hooks ---

/**
 * Hook to fetch the list of all modules for the current user.
 */
export const useAllModules = () => {
  return useQuery(allModulesQueryOptions())
}

/**
 * Hook to fetch detailed module information (Module view type).
 * @param moduleId The ID of the module.
 */
export const useModule = (moduleId: string | null | undefined) => {
  return useQuery(moduleQueryOptions(moduleId!))
}

/**
 * Hook to fetch stats for a single module.
 * @param moduleId The ID of the module.
 */
export const useModuleStats = (moduleId: string | null | undefined) => {
  return useQuery<ModuleStats | null, Error>({
    queryKey: moduleKeys.stats(moduleId!),
    queryFn: () => getModuleStats(moduleId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })
}

/**
 * Hook to create a new module.
 */
export const useCreateModule = () => {
  const queryClient = useQueryClient()

  return useMutation<Module | null, Error, CreateModuleHookInput>({
    mutationFn: (vars) => createModule(vars.title, vars.overview),
    onSuccess: (newModule) => {
      if (newModule) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.list })
        queryClient.setQueryData(moduleKeys.detail(newModule.id), newModule)
        if (newModule.stats) {
          queryClient.setQueryData(moduleKeys.stats(newModule.id), newModule.stats)
        }
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

  return useMutation<Module | null, Error, UpdateModuleHookInput, UpdateModuleHookContext>({
    mutationFn: (vars) => updateModule(vars.moduleId, vars.updates),
    onMutate: async ({ moduleId, updates }) => {
      await queryClient.cancelQueries({ queryKey: moduleKeys.detail(moduleId) })
      const previousModule = queryClient.getQueryData<Module>(moduleKeys.detail(moduleId))
      if (previousModule) {
        queryClient.setQueryData<Module>(moduleKeys.detail(moduleId), {
          ...previousModule,
          ...updates,
          updatedAt: new Date().toISOString(),
        })
      }
      return { previousModule, moduleId }
    },
    onError: (err, variables, context) => {
      console.error(`Error updating module ${variables.moduleId}:`, err)
      if (context?.previousModule) {
        queryClient.setQueryData(moduleKeys.detail(context.moduleId), context.previousModule)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
      queryClient.invalidateQueries({ queryKey: moduleKeys.list })
    },
  })
}

/**
 * Hook to delete a module.
 */
export const useDeleteModule = () => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, DeleteModuleHookInput>({
    mutationFn: (vars) => deleteModule(vars.moduleId),
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.list })
        queryClient.removeQueries({ queryKey: moduleKeys.detail(variables.moduleId), exact: true })
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

  return useMutation<ModuleSource | null, Error, AddSourceHookInput>({
    mutationFn: (vars) => addModuleSource(vars.moduleId, vars.sourceData),
    onSuccess: (newSource, variables) => {
      if (newSource) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
      }
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

  return useMutation<boolean, Error, DeleteSourceHookInput>({
    mutationFn: (vars) => deleteModuleSource(vars.sourceId),
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
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

  return useMutation<ModuleStats | null, Error, UpdateStatsHookInput>({
    mutationFn: (vars) => {
      const dbUpdate: DbStatsUpdate = {
        current_box: vars.statsUpdate.currentBox,
        next_review_at: vars.statsUpdate.nextReviewAt,
      }
      Object.keys(dbUpdate).forEach(
        (key) =>
          dbUpdate[key as keyof DbStatsUpdate] === undefined &&
          delete dbUpdate[key as keyof DbStatsUpdate]
      )
      return updateModuleStats(vars.moduleId, dbUpdate)
    },
    onSuccess: (updatedStats, variables) => {
      if (updatedStats) {
        queryClient.invalidateQueries({ queryKey: moduleKeys.stats(variables.moduleId) })
        queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) })
        queryClient.setQueryData(moduleKeys.stats(variables.moduleId), updatedStats)
        queryClient.setQueryData<Module | null>(moduleKeys.detail(variables.moduleId), (oldData) =>
          oldData ? { ...oldData, stats: updatedStats } : null
        )
      }
    },
    onError: (error, variables) => {
      console.error(`Error updating stats for module ${variables.moduleId}:`, error)
    },
  })
}
