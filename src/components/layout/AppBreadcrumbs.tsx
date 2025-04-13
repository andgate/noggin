import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text, Title } from '@mantine/core'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useMemo } from 'react'

// Define a type for our breadcrumb items
interface BreadcrumbItem {
  label: string
  path: string
}

interface AppBreadcrumbsProps {
  fallbackTitle?: string
}

export function AppBreadcrumbs({ fallbackTitle }: AppBreadcrumbsProps) {
  const router = useRouterState()
  const navigate = useNavigate()
  const currentPath = router.location.pathname

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'Home', path: '/' }]

    if (currentPath.includes('/quiz/session/')) {
      return []
    }

    const segments = currentPath.split('/').filter(Boolean)
    if (segments.length === 0) return items

    // Parse path and build breadcrumbs based on URL structure
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      // Handle special segments
      if (segment === 'library') {
        items.push({
          label: 'Library',
          path: '/library',
        })
        break
      } else if (segment === 'module' && segments[i + 1] === 'view') {
        const moduleId = segments[i + 2]
        if (moduleId) {
          // Add 'Library' if coming directly to a module? Or rely on AppLayout nav?
          // For simplicity, let's assume navigation happens via Browse or Home first.
          // If direct access needs 'Browse', add it here conditionally.
          // if (!items.some((item) => item.label === 'Browse')) {
          //   items.push({ label: 'Browse', path: '/library' });
          // }
          items.push({
            label: 'Module', // Maybe fetch module title later for better label
            path: `/module/view/${moduleId}`,
          })
        }
        i += 2 // Skip next 2 segments (view, moduleId)
      } else if (segment === 'quiz' && segments[i + 1] === 'view') {
        // Updated quiz view path: /quiz/view/$moduleId/$quizId
        const moduleId = segments[i + 2]
        const quizId = segments[i + 3]
        if (moduleId && quizId) {
          // Add Module link
          items.push({
            label: 'Module', // Fetch title?
            path: `/module/view/${moduleId}`,
          })
          items.push({
            label: 'Quiz', // Fetch title?
            path: `/quiz/view/${moduleId}/${quizId}`,
          })
        }
        i += 3 // Skip next 3 segments
      } else if (segment === 'submission') {
        // Updated submission path: /submission/$moduleId/$quizId/$attempt
        const moduleId = segments[i + 1]
        const quizId = segments[i + 2]
        const attempt = segments[i + 3]
        if (moduleId && quizId && attempt) {
          // Module link
          items.push({
            label: 'Module',
            path: `/module/view/${moduleId}`,
          })
          // Quiz link
          items.push({
            label: 'Quiz',
            path: `/quiz/view/${moduleId}/${quizId}`,
          })
          items.push({
            label: 'Submission',
            path: `/submission/${moduleId}/${quizId}/${attempt}`,
          })
        }
        i += 3 // Skip next 3 segments
      } else if (segment === 'module' && segments[i + 1] === 'create') {
        items.push({
          label: 'Create Module',
          path: '/module/create',
        })
        i += 1 // Skip next segment
      }
      // Add other specific routes like /settings if needed
      else if (segment === 'settings') {
        // Example: Assuming a /settings route exists
        // items.push({ label: 'Settings', path: '/settings' });
      }
    }

    return items
  }, [currentPath])

  // If no breadcrumbs (or just Home), show the fallback title
  if (breadcrumbs.length <= 1) {
    return fallbackTitle ? (
      <Title order={4} style={{ lineHeight: 1 }}>
        {fallbackTitle}
      </Title>
    ) : null
  }

  return (
    <MantineBreadcrumbs>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1

        return isLast ? (
          <Text
            key={index}
            style={{
              color: 'var(--mantine-color-white)',
              fontWeight: 'bold',
            }}
          >
            {item.label}
          </Text>
        ) : (
          <Anchor
            key={index}
            onClick={() => navigate({ to: item.path })}
            style={{
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Anchor>
        )
      })}
    </MantineBreadcrumbs>
  )
}
