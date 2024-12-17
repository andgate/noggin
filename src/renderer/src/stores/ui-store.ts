import { create } from 'zustand'

interface UiState {
    explorerCollapsed: boolean
    toggleExplorer: () => void
}

export const useUiStore = create<UiState>((set) => ({
    explorerCollapsed: false,
    toggleExplorer: () => set((state) => ({ explorerCollapsed: !state.explorerCollapsed })),
}))
