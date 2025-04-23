import { DefaultCatchBoundary } from '@/components/errors/DefaultCatchBoundary'
import { NotFound } from '@/components/errors/NotFound'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// TODO mantine css files
// other css files are required only if
// you are using components from the corresponding package
// import datesCssUrl from '@mantine/dates/styles.css?url'
// import dropzoneCssUrl from '@mantine/dropzone/styles.css?url'
// import codeHighlightCssUrl from '@mantine/code-highlight/styles.css?url'

// Import the generated route tree
import { routeTree } from '../routes/routeTree.gen'
import { AuthProvider } from './auth/AuthProvider'

// Create a single QueryClient instance
const queryClient = new QueryClient()

const hashHistory = import.meta.env.DEV ? createBrowserHistory() : createHashHistory()

// Create a new router instance
const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: () => <NotFound />,
  context: {
    queryClient,
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>
  )
}
