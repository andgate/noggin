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

        // Skip for quiz session - never show breadcrumbs there
        if (currentPath.includes('/quiz/session/')) {
            return []
        }

        const segments = currentPath.split('/').filter(Boolean)
        if (segments.length === 0) return items

        // Parse path and build breadcrumbs based on URL structure
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]

            // Handle special segments
            if (segment === 'library' && segments[i + 1] === 'view') {
                const libraryId = segments[i + 2]
                if (libraryId) {
                    items.push({
                        label: 'Library',
                        path: `/library/view/${libraryId}`,
                    })
                }
                i += 2 // Skip next 2 segments (view, libraryId)
            } else if (segment === 'module' && segments[i + 1] === 'view') {
                const libraryId = segments[i + 2]
                const moduleId = segments[i + 3]
                if (libraryId && moduleId) {
                    // Only add Library if not already in the breadcrumbs
                    if (!items.some((item) => item.label === 'Library')) {
                        items.push({
                            label: 'Library',
                            path: `/library/view/${libraryId}`,
                        })
                    }
                    items.push({
                        label: 'Module',
                        path: `/module/view/${libraryId}/${moduleId}`,
                    })
                }
                i += 3 // Skip next 3 segments
            } else if (segment === 'quiz' && segments[i + 1] === 'view') {
                const libraryId = segments[i + 2]
                const moduleId = segments[i + 3]
                const quizId = segments[i + 4]
                if (libraryId && moduleId && quizId) {
                    // Only add Library if not already in the breadcrumbs
                    if (!items.some((item) => item.label === 'Library')) {
                        items.push({
                            label: 'Library',
                            path: `/library/view/${libraryId}`,
                        })
                    }
                    // Only add Module if not already in the breadcrumbs
                    if (!items.some((item) => item.label === 'Module')) {
                        items.push({
                            label: 'Module',
                            path: `/module/view/${libraryId}/${moduleId}`,
                        })
                    }
                    items.push({
                        label: 'Quiz',
                        path: `/quiz/view/${libraryId}/${moduleId}/${quizId}`,
                    })
                }
                i += 4 // Skip next 4 segments
            } else if (segment === 'submission') {
                const libraryId = segments[i + 1]
                const moduleId = segments[i + 2]
                const quizId = segments[i + 3]
                const attempt = segments[i + 4]
                if (libraryId && moduleId && quizId && attempt) {
                    // Only add Library if not already in the breadcrumbs
                    if (!items.some((item) => item.label === 'Library')) {
                        items.push({
                            label: 'Library',
                            path: `/library/view/${libraryId}`,
                        })
                    }
                    // Only add Module if not already in the breadcrumbs
                    if (!items.some((item) => item.label === 'Module')) {
                        items.push({
                            label: 'Module',
                            path: `/module/view/${libraryId}/${moduleId}`,
                        })
                    }
                    // Only add Quiz if not already in the breadcrumbs
                    if (!items.some((item) => item.label === 'Quiz')) {
                        items.push({
                            label: 'Quiz',
                            path: `/quiz/view/${libraryId}/${moduleId}/${quizId}`,
                        })
                    }
                    items.push({
                        label: 'Submission',
                        path: `/submission/${libraryId}/${moduleId}/${quizId}/${attempt}`,
                    })
                }
                i += 4 // Skip next 4 segments
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
                        onClick={() => navigate({ to: item.path as any })}
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
