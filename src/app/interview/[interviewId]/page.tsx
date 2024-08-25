import { Interview } from "../interview";

export default async function InterviewPage({
  params,
}: {
  params: { interviewId: string };
}) {
  const interviewId = Number(params.interviewId);

  return (
    <main className="-mt-20 flex h-full flex-col items-center justify-center">
      <Interview interviewId={interviewId} />
    </main>
  );
}
