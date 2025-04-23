import { Submission } from '@/core/types/submission.types'
import { GeneratedGrades } from '../types/generated-grades.types'

export type GradeSubmissionInput = {
  submission: Submission
  apiKey: string
}

/**
 * Grades a submission using AI.
 * Returns the raw graded submission data (without submissionId),
 * conforming to the GradedSubmission type from quiz-generation-types.
 */
export async function gradeSubmission({
  apiKey,
  submission,
}: GradeSubmissionInput): Promise<GeneratedGrades> {
  // Return type is the raw AI output type
  console.log('>>> aiService.gradeSubmission called for submission:', submission.id)
  const gradingContext = questions
    .map((q) => {
      const response = submission.responses?.find((r: DbResponse) => r.question_id === q.id)
      const userAnswer = response?.student_answer_text

      let questionDetails = `Question ${q.id} (Type: ${q.question_type}):\n${q.question_text}`
      if (q.question_type === 'multiple_choice' && q.choices) {
        questionDetails += `\nOptions: ${JSON.stringify(q.choices)}`
        questionDetails += `\nCorrect Answer Text: ${q.correct_answer_text}`
      } else if (q.question_type === 'written') {
        questionDetails += `\nIdeal Correct Answer: ${q.correct_answer_text ?? '[Not Provided]'}`
      }
      questionDetails += `\nStudent Answer: ${userAnswer ?? '[No Answer]'}`
      return questionDetails
    })
    .join('\n\n')

  const parts: Part[] = [
    {
      text: `Grade the following student submission based on the provided questions, correct answers, and student answers. For each question, provide specific feedback and indicate if the student's answer is correct (true/false). Also, provide overall feedback for the entire submission and calculate the total score (number of correct answers).
Context:
---
${gradingContext}
---`,
    },
  ]

  // Use the schema for the AI's expected raw output
  // Note: gradedSubmissionSchema in quiz-generation-types *already* lacks submissionId
  const geminiSchema = toGeminiSchema(gradedSubmissionSchema)

  // Call AI and validate against the schema matching the AI's expected output
  const aiGradingResult = await callAiFunction({
    parts,
    geminiSchema,
    zodSchema: gradedSubmissionSchema, // Validate against the schema defined in quiz-generation-types
  })

  // The validated result directly matches the GradedSubmission type from quiz-generation-types
  // No need to add submissionId here; that happens in the calling code.

  // Optional: Validate total score (if the schema includes it, which it might not)
  // if (aiGradingResult.totalScore !== undefined) {
  //   const calculatedCorrectCount = aiGradingResult.responses.reduce(
  //     (sum, r) => sum + (r.isCorrect ? 1 : 0),
  //     0
  //   );
  //   if (calculatedCorrectCount !== aiGradingResult.totalScore) {
  //     console.warn(
  //       `AI total score (${aiGradingResult.totalScore}) does not match calculated count (${calculatedCorrectCount}).`
  //     );
  //     // Decide if you want to trust the AI's score or the calculated one.
  //     // aiGradingResult.totalScore = calculatedCorrectCount; // Example: Overwrite
  //   }
  // }

  return aiGradingResult // Return the raw, validated AI output
}
