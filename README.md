![Tests](https://github.com/andgate/noggin/actions/workflows/tests.yml/badge.svg)
[![Discord](https://img.shields.io/discord/1303464423331074139?color=blueviolet&logo=discord)](https://discord.gg/YX88XMcCyC)
![license](https://img.shields.io/github/license/andgate/noggin)
![status](https://img.shields.io/badge/Status-%20Ready%20for%20Awesome-red.svg)

# 🧠 Noggin

A modern quiz application built with Electron, React, and TypeScript.

> **Warning**
> This software is currently in alpha stage and under active development. Features may be incomplete, unstable, or subject to breaking changes. Use at your own risk.

## ✨ Features

- Create and manage quizzes
- Quiz generation with OpenAI
- Practice mode for quiz taking
- Submission evaluation with OpenAI
- View submission results
- Clean, responsive UI using Mantine components
- E2E test coverage with Playwright

## 📋 Prerequisites

- Node.js (LTS version recommended)
- pnpm 9.12.3 or higher

## 🚀 Quick Start

Go to the [releases page](https://github.com/andgate/noggin/releases) and download the latest release for your operating system. Currently only Windows and Linux are supported.

Once downloaded, run the application by double clicking the executable file. The installer will install the application and launch it.

First time running the application you will need to enter a valid OpenAI API key in the settings menu.

To get an OpenAI API key, see [here](https://platform.openai.com/api-keys). You will need to create a new key with permissions for `gpt-4o`. This is not a free service and you will need to load credits to your account.

## 🛠️ Development Setup

1. Clone the repository:

```bash
git clone https://github.com/andgate/noggin.git
cd noggin
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development server:

```bash
pnpm dev
```

## 🔍 Debugging

The project includes VSCode debugging configurations for both the main and renderer processes:

1. Open the project in VSCode
2. Set breakpoints in your code (main process or renderer process)
3. Go to the Run and Debug view (Ctrl+Shift+D)
4. Select "Debug All" from the dropdown
5. Press F5 to start debugging

You can also debug processes individually:

- Use "Debug Main Process" for main process only
- Note: Renderer process debugging requires the main process to be running first

For debugging E2E tests in Docker:

1. Set breakpoints in your E2E test files
2. Select "Debug Docker E2E" from the debug configurations
3. Press F5 to start debugging the Docker-based E2E tests

## 📦 Building

To build the application:

```bash
# For Windows
pnpm build:win

# For Linux
pnpm build:linux
```

## 🧪 Testing

Run the test suites:

```bash
# Run Vitest tests
pnpm test

# Run E2E tests with Playwright
pnpm test:e2e

# Run E2E tests in Docker
docker build -t playwright-e2e-tests -f Dockerfile.e2e .
docker run --rm --ipc=host playwright-e2e-tests
```

The Docker-based E2E tests run in headless mode and are particularly useful for CI environments or ensuring consistent test behavior across different development machines.

## 📦 Release

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

## 📜 Available Scripts

- `pnpm dev` - Start development server
- `pnpm start` - Start production server
- `pnpm build` - Build for production
- `pnpm build:unpack` - Build and unpack without packaging
- `pnpm build:win` - Build for Windows (without publishing)
- `pnpm build:linux` - Build for Linux (without publishing)
- `pnpm publish:win` - Build and publish for Windows
- `pnpm publish:linux` - Build and publish for Linux
- `pnpm check` - Type check all code
- `pnpm check:node` - Type check Node.js code in watch mode
- `pnpm check:ui` - Type check web code in watch mode
- `pnpm generate` - Generate database migrations
- `pnpm push` - Push database changes
- `pnpm studio` - Open Drizzle Studio
- `pnpm test` - Run Vitest tests
- `pnpm test:e2e` - Run Playwright E2E tests with UI
- `pnpm test:ci` - Run Vitest tests in CI
- `pnpm test:e2e:ci` - Run Playwright tests in CI
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm rebuild:drizzle` - Rebuild better-sqlite3
- `pnpm rebuild:electron` - Rebuild Electron dependencies

## 🔧 Tech Stack

- Electron
- React 18
- TypeScript
- Mantine v7
- TanStack Router & React Query
- @tabler/icons-react
- Playwright (Testing)
- electron-vite
- Prettier & ESLint

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
