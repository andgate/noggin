import { useAllModules } from '@/core/hooks/useModuleHooks'
import { Tables } from '@/shared/types/database.types'
import { useMemo } from 'react'
import { buildModuleTreeData } from '../common/module-tree'

type DbModule = Tables<'modules'>

/**
 * Custom hook to fetch all user modules and prepare tree data for display.
 */
export function useModuleTreeData() {
  // Fetch all modules using the refactored hook
  const { data: modules = [], isLoading } = useAllModules()

  // Convert modules into tree data structure using the simplified builder - memoized
  const treeData = useMemo(
    () =>
      // Pass the fetched modules directly to the builder
      buildModuleTreeData(modules as DbModule[]),
    [modules]
  )

  return {
    treeData,
    isLoading,
  }
}
