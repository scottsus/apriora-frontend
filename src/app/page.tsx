"use client";

import { Button } from "~/components/button";
import { useState } from "react";

import { Interview } from "./interview";

export enum InterviewState {
  initial,
  inProgress,
  completed,
}

export default function HomePage() {
  const [interviewState, setInterviewState] = useState<InterviewState>(
    InterviewState.initial,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {interviewState === InterviewState.initial && (
        <div>
          <p>Please begin</p>
          <Button onClick={() => setInterviewState(InterviewState.inProgress)}>
            Let&apos;s start
          </Button>
        </div>
      )}

      {interviewState === InterviewState.inProgress && (
        <Interview setInterviewState={setInterviewState} />
      )}

      {interviewState === InterviewState.completed && (
        <div>
          <p>Thanks for your time!</p>
          <Button onClick={() => setInterviewState(InterviewState.initial)}>
            Do another
          </Button>
        </div>
      )}
    </main>
  );
}
