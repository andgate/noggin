import { createFileRoute, ErrorComponent, ErrorComponentProps } from "@tanstack/react-router";
import { SubmissionPage } from "../../pages/Submission.page";
import { getSubmission } from "../../services/submission-service";
import { NotFound } from "../../components/NotFound";

export const Route = createFileRoute("/quiz/submission/$submissionId")({
    loader: async ({ params: { submissionId } }) => {
        const submission = await getSubmission(Number(submissionId));
        return submission;
    },

    errorComponent: SubmissionErrorComponent,
    component: RouteComponent,
    notFoundComponent: () => {
        return <NotFound>Submission not found</NotFound>;
    },
});

export function SubmissionErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />;
}

function RouteComponent() {
    const submission = Route.useLoaderData();
    return <SubmissionPage submission={submission} />;
}
