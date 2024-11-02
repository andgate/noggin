# Noggin

A modern quiz application built with React, TypeScript, and Ant Design.

## Features

-   Create and manage quizzes
-   Practice mode for quiz taking
-   View quiz results
-   Clean, responsive UI using Ant Design components
-   Full test coverage with Playwright

## Prerequisites

-   Node.js (LTS version recommended)
-   pnpm 9.11.0 or higher

## Getting Started

1. Clone the repository:

```bash
git clone
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

4. Intialize the database:

```bash
pnpm generate
pnpm push
```

## Development

Start the development server:

```bash
pnpm dev
```

## Testing

Run the test suite:

```bash
pnpm test
```

### Available Scripts

-   `pnpm dev` - Start development server
-   `pnpm build` - Build for production
-   `pnpm start` - Start production server
-   `pnpm generate` - Generate database migrations
-   `pnpm push` - Push database changes
-   `pnpm studio` - Open Drizzle Studio
-   `pnpm test` - Run tests
-   `pnpm lint` - Run linting

## Tech Stack

-   React 18
-   Vinxi
-   TanStack Router
-   Drizzle ORM
-   SQLite (better-sqlite3)
-   Ant Design
-   TypeScript
-   Playwright (Testing)

## License

[MIT](LICENSE)
