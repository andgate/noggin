# Noggin

A modern quiz application built with React, TypeScript, and Mantine.

## Features

-   Create and manage quizzes
-   Practice mode for quiz taking
-   View quiz results
-   Clean, responsive UI using Mantine components
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
-   Mantine v7
-   @tabler/icons-react
-   TypeScript
-   Playwright (Testing)

## License

Copyright 2024 Gabriel Anderson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
