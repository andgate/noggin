// TODO: Add a regenerate button
import { Alert, Button, Skeleton, Paper, Stack, Group, Title, Badge, Text } from "@mantine/core";
import { useState, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { generateQuestion, generateQuizTitle } from "~/services/quiz-generation-service";
import { GeneratedQuestion, GeneratedQuiz } from "~/types/quiz-generation-types";
import { createQuiz } from "~/services/quiz-service";
import { QuestionType } from "~/types/quiz-view-types";
import { produce } from "immer";
import { useNavigate } from "@tanstack/react-router";

export interface QuestionItemProps {
    index: number;
    question?: GeneratedQuestion;
    isLoading: boolean;
    error?: Error;
}

// Question component with generation logic
const QuestionGenerator: React.FC<QuestionItemProps> = ({ index, question, isLoading, error }) => {
    console.log("[QuestionGenerator] Rendering", { index, question, isLoading, error });
    if (error) return <Alert color="red">Failed to generate question {index + 1}</Alert>;
    if (isLoading || !question) return <Skeleton height={100} mb="md" animate={true} />;

    return (
        <Paper withBorder p="md" mb="md" radius="md">
            <Stack gap="sm">
                <Group justify="space-between" align="center">
                    <Title order={4}>Question {index + 1}</Title>
                    <Badge>{question.questionType === "multiple_choice" ? "Multiple Choice" : "Written"}</Badge>
                </Group>

                <Text>{question.question}</Text>

                {question.questionType === "multiple_choice" && (
                    <Stack gap="xs">
                        {question.choices.map((choice, choiceIndex) => (
                            <Paper key={choiceIndex} withBorder p="xs">
                                <Group gap="sm">
                                    <Text size="sm" fw={400}>
                                        {choice.text}
                                    </Text>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
};

export interface QuizTitleProps {
    title?: string;
    isLoading: boolean;
    error?: Error;
}

// Quiz title component with generation logic
const QuizTitleGenerator: React.FC<QuizTitleProps> = ({ title, isLoading, error }) => {
    console.log("[QuizTitleGenerator] Rendering", { title, isLoading, error });
    if (error)
        return (
            <Alert color="red" title="Title Generation Error">
                Title failed
            </Alert>
        );
    if (isLoading || !title) return <Skeleton height={50} mb="xl" animate={true} />;

    return <h2>{title}</h2>;
};

interface QuizGeneratorProps {
    show: boolean;
    sources: string[];
    questionTypes: QuestionType[];
    questionCount: number;
}

interface QuizGeneratorState {
    title?: string;
    questions: (GeneratedQuestion | undefined)[];
}

// Add this interface for the imperative handle
export interface QuizGeneratorHandle {
    run: () => void;
}

/** Quiz generator component
 *
 * When mounted, the component will generate a quiz.
 * It is recommended to use the components `key` prop to control when generation is triggered.
 * This can be accomplished by passing in a simple number state and incrementing it to run the generation again.
 *
 * @param sources - The sources to use for the quiz
 * @param questionTypes - The question types to use for the quiz
 * @param questionCount - The number of questions to generate
 */
export const QuizGenerator = forwardRef<QuizGeneratorHandle, QuizGeneratorProps>(
    ({ show, sources, questionTypes, questionCount }, ref) => {
        const navigate = useNavigate({ from: "/quiz/create" });
        const [quizState, setQuizState] = useState<QuizGeneratorState>({
            questions: Array(questionCount).fill(undefined),
        });
        const [isSaving, setIsSaving] = useState(false);
        const [saveError, setSaveError] = useState<Error | undefined>(undefined);
        const [titleError, setTitleError] = useState<Error | undefined>(undefined);
        const [questionsErrors, setQuestionsErrors] = useState<(Error | undefined)[]>(
            Array(questionCount).fill(undefined),
        );
        const [isGenerating, setIsGenerating] = useState(false);

        const { title, questions } = useMemo(() => quizState, [quizState]);
        const isGenerationComplete = useMemo(() => title && questions.every(Boolean), [title, questions]);

        // Create AbortController
        const controller = useMemo(() => new AbortController(), []);

        const setQuestions = useCallback((questions: (GeneratedQuestion | undefined)[]) => {
            setQuizState(
                produce((draft) => {
                    draft.questions = questions;
                }),
            );
        }, []);

        const setQuestion = useCallback((index: number, question: GeneratedQuestion) => {
            setQuizState(
                produce((draft) => {
                    draft.questions[index] = question;
                }),
            );
        }, []);

        const setTitle = useCallback((title: string | undefined) => {
            setQuizState(
                produce((draft) => {
                    draft.title = title;
                }),
            );
        }, []);

        const resetQuizGeneration = useCallback(() => {
            setTitle(undefined);
            setQuestions(Array(questionCount).fill(undefined));
            setTitleError(undefined);
            setQuestionsErrors(Array(questionCount).fill(null));
        }, [questionCount, setTitle, setQuestions]);

        // Add the generation function
        const runGeneration = useCallback(async () => {
            console.log("[QuizGenerator] Starting quiz generation");
            setIsGenerating(true);
            resetQuizGeneration();

            try {
                const questions: GeneratedQuestion[] = [];

                for (let index = 0; index < questionCount; index++) {
                    try {
                        const question = await generateQuestion({
                            sources,
                            questions,
                            questionTypes,
                            controller,
                        });
                        setQuestion(index, question);
                        questions.push(question);
                    } catch (error) {
                        if (error instanceof DOMException && error.name === "AbortError") {
                            console.log("[QuizGenerator] Generation aborted");
                            return;
                        }
                        setQuestionsErrors((prev) =>
                            produce(prev, (errs) => {
                                errs[index] = error as Error;
                            }),
                        );
                    }
                }

                try {
                    const title = await generateQuizTitle({
                        sources,
                        questions,
                        controller,
                    });
                    setTitle(title);
                    return { title, questions };
                } catch (error) {
                    if (error instanceof DOMException && error.name === "AbortError") {
                        console.log("[QuizGenerator] Title generation aborted");
                        return;
                    }
                    setTitleError(error as Error);
                }
            } finally {
                setIsGenerating(false);
            }
        }, [controller, questionCount, questionTypes, resetQuizGeneration, setQuestion, setTitle, sources]);

        const handleCancel = useCallback(() => {
            console.log("[QuizGenerator] Cancelling generation");
            controller.abort();
        }, [controller]);

        // Expose the run function via useImperativeHandle
        useImperativeHandle(
            ref,
            () => ({
                run: runGeneration,
            }),
            [runGeneration],
        );

        const handleSave = async () => {
            if (!title || questions.some((q) => !q)) {
                console.log("[Save] Cannot save - incomplete quiz:", {
                    title,
                    questions,
                });
                return;
            }

            console.log("[Save] Starting save with:", {
                title,
                questions,
                sources,
            });
            setIsSaving(true);
            setSaveError(undefined);

            try {
                const generatedQuiz: GeneratedQuiz = {
                    title: title,
                    questions: questions as GeneratedQuestion[],
                };
                const quizId = await createQuiz({ generatedQuiz, sources });
                console.log("[Save] Quiz saved successfully");
                return quizId;
            } catch (error) {
                console.error("[Save] Save failed:", error);
                setSaveError(error as Error);
            } finally {
                setIsSaving(false);
            }
        };

        const handleStartPractice = async () => {
            const quizId = await handleSave();
            navigate({ to: "/quiz/practice/$quizId", params: { quizId: `${quizId}` } });
        };

        if (!show) return <></>;

        return (
            <div>
                <Group mt="xl">
                    <Button
                        onClick={handleStartPractice}
                        disabled={!isGenerationComplete}
                        loading={isSaving}
                        variant="light"
                    >
                        Practice Now
                    </Button>
                    {isGenerating && (
                        <Button onClick={handleCancel} color="red" variant="light">
                            Cancel
                        </Button>
                    )}
                </Group>

                <QuizTitleGenerator title={title} isLoading={!title} error={titleError} />
                <div>
                    {questions.map((_, index) => (
                        <QuestionGenerator
                            index={index}
                            question={questions[index]}
                            isLoading={!questions[index]}
                            error={questionsErrors[index]}
                        />
                    ))}
                </div>

                {saveError && (
                    <Alert color="red" mt="md">
                        Failed to save quiz: {saveError.message}
                    </Alert>
                )}
            </div>
        );
    },
);
