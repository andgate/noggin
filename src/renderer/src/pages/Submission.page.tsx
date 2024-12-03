// import { Card, Container, Stack, Text, Title } from '@mantine/core'
// import { Submission } from '@noggin/types/quiz-types'

// // TODO: Add detailed analytics for quiz performance
// // TODO: Implement answer comparison visualization
// // TODO: Add export functionality for results
// // TODO: Consider adding share capabilities
// // TODO: Implement SSR for submission data
// // TODO: Add loading states for score calculations
// // TODO: Add error boundaries for failed submission loads
// // TODO: Implement retry mechanism for failed data fetches
// export const SubmissionPage: React.FC<{
//     submission: Submission
// }> = ({ submission }) => {
//     // TODO: Add fallback UI for partial submission data
//     // TODO: Implement progressive enhancement for analytics
//     // TODO: Add error recovery for failed score displays
//     console.log('submission', submission)
//     return (
//         <Container size="md" py="xl">
//             <Stack gap="lg">
//                 <Title order={1}>{submission.quizTitle}</Title>
//                 <Text size="lg" fw={700}>
//                     Final Grade: {submission.grade}%
//                 </Text>

//                 {submission.responses.map((response) => (
//                     <Card key={response.id} withBorder>
//                         <Stack gap="md">
//                             <Text fw={600}>{response.question.question}</Text>

//                             <Text>Your Answer: {response.studentAnswer}</Text>

//                             <Text c="dimmed">Correct Answer: {response.correctAnswer}</Text>

//                             <Stack gap="xs">
//                                 <Text fw={500}>
//                                     Result: {response.verdict === 'pass' ? 'Correct' : 'Incorrect'}
//                                 </Text>
//                                 {response.feedback && (
//                                     <Text c="dimmed">Feedback: {response.feedback}</Text>
//                                 )}
//                             </Stack>
//                         </Stack>
//                     </Card>
//                 ))}
//             </Stack>
//         </Container>
//     )
// }
