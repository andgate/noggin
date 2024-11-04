# Noggin

A modern quiz application built with React, TypeScript, and Mantine.

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
-   pnpm 9.11.0 or higher

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

Initialize database and start the app

```bash
pnpm push
pnpm dev
```

Visit `http://localhost:5173` to start using Noggin!

Your data is stored in an SQLite database in the root of the project, `sqlite.db`.

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
-   Mantine v7
-   @tabler/icons-react
-   TypeScript
-   Playwright (Testing)

## License

Copyright 2024 Gabriel Anderson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
