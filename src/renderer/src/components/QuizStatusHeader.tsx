// import { Button, Group, Text } from '@mantine/core'
// import { notifications } from '@mantine/notifications'
// import { useActiveQuiz } from '@renderer/hooks/use-active-quiz'
// import { useMatches, useNavigate } from '@tanstack/react-router'
// import { useEffect, useMemo } from 'react'
// import { formatDuration } from '../pages/PracticeQuiz.page'

// export function QuizHeader() {
//     const navigate = useNavigate()
//     const { activeQuizState, isQuizInProgress, timeLimit, elapsedTime } = useActiveQuiz()
//     const quizId = useMemo(() => activeQuizState.quiz?.id, [activeQuizState])

//     const matches = useMatches()
//     const isQuizPracticePage = matches.some((match) => match.pathname.startsWith('/quiz/practice/'))

//     useEffect(() => {
//         if (isQuizInProgress && timeLimit && elapsedTime >= timeLimit) {
//             notifications.show({
//                 title: "Time's up!",
//                 message: 'Your quiz is being submitted automatically.',
//                 color: 'blue',
//             })
//         }
//     }, [isQuizInProgress, timeLimit, elapsedTime])

//     return (
//         <Group>
//             {quizId !== undefined && !isQuizPracticePage && isQuizInProgress && (
//                 <Button
//                     size="compact-md"
//                     onClick={() =>
//                         navigate({
//                             to: '/quiz/practice/$quizId',
//                             params: { quizId: `${quizId}` },
//                         })
//                     }
//                 >
//                     Return
//                 </Button>
//             )}
//             {isQuizInProgress && timeLimit && (
//                 <Text c={elapsedTime >= timeLimit - 60 ? 'red' : 'green'}>
//                     Time: {formatDuration(Math.max(0, timeLimit - elapsedTime))}
//                 </Text>
//             )}
//         </Group>
//     )
// }
