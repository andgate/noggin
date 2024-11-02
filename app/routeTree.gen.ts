/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as QuizResultsImport } from './routes/quiz/results'
import { Route as QuizPracticeImport } from './routes/quiz/practice'
import { Route as QuizCreateImport } from './routes/quiz/create'
import { Route as QuizViewQuizIdImport } from './routes/quiz/view.$quizId'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const QuizResultsRoute = QuizResultsImport.update({
  id: '/quiz/results',
  path: '/quiz/results',
  getParentRoute: () => rootRoute,
} as any)

const QuizPracticeRoute = QuizPracticeImport.update({
  id: '/quiz/practice',
  path: '/quiz/practice',
  getParentRoute: () => rootRoute,
} as any)

const QuizCreateRoute = QuizCreateImport.update({
  id: '/quiz/create',
  path: '/quiz/create',
  getParentRoute: () => rootRoute,
} as any)

const QuizViewQuizIdRoute = QuizViewQuizIdImport.update({
  id: '/quiz/view/$quizId',
  path: '/quiz/view/$quizId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/quiz/create': {
      id: '/quiz/create'
      path: '/quiz/create'
      fullPath: '/quiz/create'
      preLoaderRoute: typeof QuizCreateImport
      parentRoute: typeof rootRoute
    }
    '/quiz/practice': {
      id: '/quiz/practice'
      path: '/quiz/practice'
      fullPath: '/quiz/practice'
      preLoaderRoute: typeof QuizPracticeImport
      parentRoute: typeof rootRoute
    }
    '/quiz/results': {
      id: '/quiz/results'
      path: '/quiz/results'
      fullPath: '/quiz/results'
      preLoaderRoute: typeof QuizResultsImport
      parentRoute: typeof rootRoute
    }
    '/quiz/view/$quizId': {
      id: '/quiz/view/$quizId'
      path: '/quiz/view/$quizId'
      fullPath: '/quiz/view/$quizId'
      preLoaderRoute: typeof QuizViewQuizIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/quiz/create': typeof QuizCreateRoute
  '/quiz/practice': typeof QuizPracticeRoute
  '/quiz/results': typeof QuizResultsRoute
  '/quiz/view/$quizId': typeof QuizViewQuizIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/quiz/create': typeof QuizCreateRoute
  '/quiz/practice': typeof QuizPracticeRoute
  '/quiz/results': typeof QuizResultsRoute
  '/quiz/view/$quizId': typeof QuizViewQuizIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/quiz/create': typeof QuizCreateRoute
  '/quiz/practice': typeof QuizPracticeRoute
  '/quiz/results': typeof QuizResultsRoute
  '/quiz/view/$quizId': typeof QuizViewQuizIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/quiz/create'
    | '/quiz/practice'
    | '/quiz/results'
    | '/quiz/view/$quizId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/quiz/create'
    | '/quiz/practice'
    | '/quiz/results'
    | '/quiz/view/$quizId'
  id:
    | '__root__'
    | '/'
    | '/quiz/create'
    | '/quiz/practice'
    | '/quiz/results'
    | '/quiz/view/$quizId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  QuizCreateRoute: typeof QuizCreateRoute
  QuizPracticeRoute: typeof QuizPracticeRoute
  QuizResultsRoute: typeof QuizResultsRoute
  QuizViewQuizIdRoute: typeof QuizViewQuizIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  QuizCreateRoute: QuizCreateRoute,
  QuizPracticeRoute: QuizPracticeRoute,
  QuizResultsRoute: QuizResultsRoute,
  QuizViewQuizIdRoute: QuizViewQuizIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/quiz/create",
        "/quiz/practice",
        "/quiz/results",
        "/quiz/view/$quizId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/quiz/create": {
      "filePath": "quiz/create.tsx"
    },
    "/quiz/practice": {
      "filePath": "quiz/practice.tsx"
    },
    "/quiz/results": {
      "filePath": "quiz/results.tsx"
    },
    "/quiz/view/$quizId": {
      "filePath": "quiz/view.$quizId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
