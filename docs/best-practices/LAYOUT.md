# Noggin Desktop Application: Project Layout Guidelines

## Overview

This document outlines the organizational structure for the Noggin desktop application's renderer codebase. The layout emphasizes modularity, separation of concerns, and component reusability while keeping related code close together.

## Core Principles

- **Page-Centric Organization**: Each page is treated as a self-contained "mini-app"
- **Colocation**: Related code stays together
- **Clear Boundaries**: Shared vs. page-specific code is clearly separated
- **Modularity**: Components and utilities are organized by their scope and usage

## Directory Structure

### Root-Level Directories

```
src/
├── app/          # Application-wide hooks and stores
├── common/       # Shared utilities and helpers
├── components/   # Shared components
├── pages/        # Page components and their specific code
└── routes/       # Route definitions
```

### Page Structure

Each page follows a consistent internal structure:

```
pages/
└── PageName/
    ├── components/   # Components specific to this page
    ├── hooks/        # Hooks specific to this page
    ├── stores/       # State management specific to this page
    ├── utils/        # Utilities specific to this page
    └── index.tsx     # Main page component
```

## Guidelines

### Components

- **Shared Components**: Place reusable components used across multiple pages in `/src/components`
- **Page Components**: Place components specific to a single page in that page's `components/` directory
- **Layout Components**: Place layout-related components in `/src/components/layout`

### State Management

- **Global State**: Place application-wide stores in `/src/app/stores`
- **Page State**: Place page-specific stores in the page's `stores/` directory

### Hooks

- **Shared Hooks**: Place hooks used across multiple pages in `/src/app/hooks`
- **Page Hooks**: Place hooks specific to a page in that page's `hooks/` directory

### Utilities

- **Shared Utilities**: Place shared helpers and utilities in `/src/common`
- **Page Utilities**: Place page-specific utilities in that page's `utils/` directory

## Best Practices

1. **Component Placement**:

    - If a component is used by multiple pages, move it to `/src/components`
    - If a component is only used within one page, keep it in that page's `components/` directory

2. **Code Organization**:

    - Keep related code close together
    - Avoid deeply nested directories
    - Use clear, descriptive names for directories and files

3. **State Management**:

    - Keep state as close as possible to where it's used
    - Lift state up to the app level only when necessary

4. **Module Boundaries**:
    - Maintain clear boundaries between pages
    - Share code through the appropriate shared directories
    - Avoid circular dependencies

## Conclusion

This layout structure promotes maintainability and scalability by keeping related code together while providing clear guidelines for code organization. It balances the needs of component reuse with the benefits of colocation, making the codebase easier to navigate and maintain.
