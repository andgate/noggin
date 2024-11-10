![Tests](https://github.com/andgate/noggin/actions/workflows/tests.yml/badge.svg)
[![Discord](https://img.shields.io/discord/1303464423331074139?color=blueviolet&logo=discord)](https://discord.gg/YX88XMcCyC)
![license](https://img.shields.io/github/license/andgate/noggin)
![status](https://img.shields.io/badge/Status-%20Ready%20for%20Awesome-red.svg)

# Noggin

A modern quiz application built with Electron, React, and TypeScript.

> **Warning**
> This software is currently in alpha stage and under active development. Features may be incomplete, unstable, or subject to breaking changes. Use at your own risk.

## Features

-   Create and manage quizzes
-   Quiz generation with OpenAI
-   Practice mode for quiz taking
-   Submission evaluation with OpenAI
-   View submission results
-   Clean, responsive UI using Mantine components
-   E2E test coverage with Playwright

## Prerequisites

-   Node.js (LTS version recommended)
-   pnpm 9.12.3 or higher

## Quick Start

Install dependencies and setup environment

```bash
pnpm install
cp .env.example .env.local
```

Add your OpenAI API key to .env.local

```bash
VITE_OPENAI_API_KEY=your-api-key-here
```

From a blank project, initialize database (`sqlite.db`) and start the development app

```bash
# Creat database
pnpm push

# Start development server
pnpm dev
```

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/andgate/noggin.git
cd noggin
```

2. Install dependencies:

```bash
pnpm install
```

3. Setup environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment:

The application requires two environment variables:

-   `DB_FILE_NAME`: The SQLite database file location
    -   Recommended value: `file:sqlite.db`
-   `VITE_OPENAI_API_KEY`: Your OpenAI API key
    -   Get your API key from: https://platform.openai.com/api-keys
    -   Ensure it has appropriate permissions for chat completions

The easiest way to set these is to copy `.env.example` to `.env.local` and populate the values.

Example `.env.local`:

```bash
DB_FILE_NAME=file:sqlite.db
VITE_OPENAI_API_KEY=your-api-key-here
```

5. Initialize the database:

```bash
pnpm generate
pnpm push
```

## Development

Start the development server:

```bash
pnpm dev
```

To build the application:

```bash
# For Windows
pnpm build:win

# For Linux
pnpm build:linux
```

## Database Migrations

When you make changes to the database schema:

1. Generate a new migration:

```bash
pnpm generate
```

2. Apply the migration to your database:

```bash
pnpm push
```

Note: Always review generated migrations before applying them to ensure they match your intended changes.

## Testing

Run the test suites:

```bash
# Run Vitest tests
pnpm test

# Run E2E tests with Playwright
pnpm test:e2e
```

## Release

The release process is mostly automated by GitHub actions, but requires some manual steps.

Before creating a release, ensure you have bumped the version number in `package.json`. Failing to do so may cause the release pipeline to fail.

To trigger a release on the current branch, push a tag to the repository:

```bash
git tag vx.x.x
git push origin vx.x.x
```

The release pipeline will build the application for Windows, and Linux, create a draft release, and upload the built assets.

MacOS builds are not currently supported.

Once the release workflow has completed, you can review the release on the repository's GitHub Releases page. After ensuring everything looks correct, you can publish the release.

### Available Scripts

-   `pnpm dev` - Start development server
-   `pnpm start` - Start production server
-   `pnpm build` - Build for production
-   `pnpm build:unpack` - Build and unpack without packaging
-   `pnpm build:win` - Build for Windows (without publishing)
-   `pnpm build:linux` - Build for Linux (without publishing)
-   `pnpm publish:win` - Build and publish for Windows
-   `pnpm publish:linux` - Build and publish for Linux
-   `pnpm check` - Type check all code
-   `pnpm check:node` - Type check Node.js code in watch mode
-   `pnpm check:ui` - Type check web code in watch mode
-   `pnpm generate` - Generate database migrations
-   `pnpm push` - Push database changes
-   `pnpm studio` - Open Drizzle Studio
-   `pnpm test` - Run Vitest tests
-   `pnpm test:e2e` - Run Playwright E2E tests with UI
-   `pnpm test:ci` - Run Vitest tests in CI
-   `pnpm test:e2e:ci` - Run Playwright tests in CI
-   `pnpm lint` - Run ESLint
-   `pnpm lint:fix` - Run ESLint with auto-fix
-   `pnpm format` - Format code with Prettier
-   `pnpm rebuild:drizzle` - Rebuild better-sqlite3
-   `pnpm rebuild:electron` - Rebuild Electron dependencies

## Tech Stack

-   Electron
-   React 18
-   TypeScript
-   Mantine v7
-   TanStack Router & React Query
-   Drizzle ORM
-   SQLite
-   @tabler/icons-react
-   Playwright (Testing)
-   electron-vite
-   Prettier & ESLint

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
