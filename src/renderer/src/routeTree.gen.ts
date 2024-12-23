/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as ModuleCreateImport } from './routes/module/create'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ModuleCreateRoute = ModuleCreateImport.update({
  id: '/module/create',
  path: '/module/create',
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
    '/module/create': {
      id: '/module/create'
      path: '/module/create'
      fullPath: '/module/create'
      preLoaderRoute: typeof ModuleCreateImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/module/create': typeof ModuleCreateRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/module/create': typeof ModuleCreateRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/module/create': typeof ModuleCreateRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/module/create'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/module/create'
  id: '__root__' | '/' | '/module/create'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ModuleCreateRoute: typeof ModuleCreateRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ModuleCreateRoute: ModuleCreateRoute,
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
        "/module/create"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/module/create": {
      "filePath": "module/create.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
