export const libraryKeys = {
  all: ['libraries'] as const,
  detail: (libraryId: string) => ['library', libraryId] as const,
}

// Add moduleKeys here
export const moduleKeys = {
  all: ['modules'] as const, // General key for all modules (might need scoping later)
  list: (libraryId: string) => ['modules', 'list', libraryId] as const,
  detail: (moduleId: string) => ['module', moduleId] as const,
  detailWithDetails: (moduleId: string) => ['module', moduleId, 'details'] as const,
  stats: (moduleId: string) => ['module', moduleId, 'stats'] as const,
  sources: (moduleId: string) => ['module', moduleId, 'sources'] as const,
}

export const quizKeys = {
  all: ['quizzes'] as const, // General key for all quizzes (might need scoping later)
  list: (moduleId: string) => ['quizzes', 'list', moduleId] as const,
  detail: (quizId: string) => ['quiz', quizId] as const,
  detailWithQuestions: (quizId: string) => ['quiz', quizId, 'questions'] as const,
}

export const submissionKeys = {
  all: ['submissions'] as const, // General key for all submissions (might need scoping later)
  listByModule: (moduleId: string) => ['submissions', 'list', 'module', moduleId] as const,
  listByQuiz: (quizId: string) => ['submissions', 'list', 'quiz', quizId] as const,
  detail: (submissionId: string) => ['submission', submissionId] as const,
  detailWithResponses: (submissionId: string) => ['submission', submissionId, 'responses'] as const,
  // Add the new key for fetching by quiz ID and attempt number
  byQuizAttempt: (quizId: string, attempt: number) =>
    ['submission', 'quiz', quizId, 'attempt', attempt] as const,
}

export const userKeys = {
  profile: ['userProfile'] as const,
}

export const storageKeys = {
  all: ['storage'] as const, // General key for storage operations
  publicUrl: (path: string) => ['storage', 'url', path] as const,
}

export const aiKeys = {
  all: ['ai'] as const,
  generateModule: ['ai', 'generateModule'] as const,
  generateQuiz: ['ai', 'generateQuiz'] as const,
  gradeSubmission: ['ai', 'gradeSubmission'] as const,
}

export const practiceFeedKeys = {
  all: ['practiceFeed'] as const,
  dueModules: ['practiceFeed', 'due'] as const,
}
