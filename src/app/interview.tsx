"use client";

import { ManagedWebcam } from "~/components/webcam";
import { useState } from "react";

import { InterviewState } from "./page";

export function Interview({
  setInterviewState,
}: {
  setInterviewState: React.Dispatch<React.SetStateAction<InterviewState>>;
}) {
  const [transcription, setTranscription] = useState<string[]>([]);
  const endInterview = () => setInterviewState(InterviewState.completed);

  return (
    <div className="bg-apriora-blue px-40 py-20">
      <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
        <ManagedWebcam
          setTranscription={setTranscription}
          closeWebcam={endInterview}
        />

        <div className="flex h-full w-72 flex-col items-center justify-start gap-y-2 bg-gray-100">
          <div className="w-full border-b border-gray-400 px-10 pb-4 pt-6">
            <p className="text-center text-sm">Live Transcript</p>
          </div>
          <ul className="flex w-full flex-1 flex-col items-start gap-y-3 overflow-y-scroll p-2">
            {transcription.map((t, index) => (
              <div key={index} className="flex flex-col justify-start gap-y-1">
                <p className="text-sm font-medium">Scott</p>
                <p className="rounded-md bg-gray-200 p-2 text-sm">{t}</p>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
