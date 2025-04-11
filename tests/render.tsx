import { MantineProvider } from '@mantine/core'
import { theme } from '@noggin/theme'
import { RenderResult, render as testingLibraryRender } from '@testing-library/react'
import React from 'react'

export function render(ui: React.ReactNode): RenderResult {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={theme}>{children}</MantineProvider>
    ),
  })
}
