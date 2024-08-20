"use client";

import { Button } from "~/components/button";
import { InterviewState } from "~/lib/types";
import { useState } from "react";

import { Interview } from "./interview";

export default function HomePage() {
  const [interviewState, setInterviewState] = useState<InterviewState>(
    InterviewState.initial,
  );

  return (
    <main className="-mt-20 flex h-full flex-col items-center justify-center">
      {interviewState === InterviewState.initial && (
        <div className="flex flex-col items-center gap-y-8">
          <h2 className="w-1/2 text-center text-6xl font-normal leading-tight">
            Hire the{" "}
            <span className="underline decoration-apriora-blue decoration-4 underline-offset-8">
              best
            </span>{" "}
            candidates faster
          </h2>
          <h3 className="w-2/3 text-center text-xl text-gray-600">
            Conduct live interviews with your AI recruiter to screen more
            candidates and make better hiring decisions
          </h3>
          <Button
            className="mt-6 rounded-xl px-12 py-4 text-2xl"
            onClick={() => setInterviewState(InterviewState.inProgress)}
          >
            Begin Interview
          </Button>
        </div>
      )}

      {interviewState === InterviewState.inProgress && (
        <Interview setInterviewState={setInterviewState} />
      )}

      {interviewState === InterviewState.completed && (
        <div className="flex flex-col items-center gap-y-6 text-center">
          <p className="text-5xl">and that&apos;s it 🚀🚀</p>
          <p className="w-2/3 text-lg text-gray-600">
            That marks the end of the interview - we hope you enjoyed it as much
            as we did, and we&apos;ll be in touch shortly for next steps.
          </p>
          <Button
            className="mt-6 rounded-xl px-10 py-3 text-xl"
            onClick={() => setInterviewState(InterviewState.initial)}
          >
            One more round :)
          </Button>
        </div>
      )}
    </main>
  );
}
