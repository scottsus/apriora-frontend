"use client";

import { useConversation } from "~/hooks/useConversation";
import { useInterviewer } from "~/hooks/useInterviewer";
import { messages } from "~/server/db/schema";
import { InferInsertModel } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";

import { ManagedWebcam } from "./webcam";

const transcriptionId = 1; // TODO: Use DB

type Message = InferInsertModel<typeof messages>;

export function Interview({ interviewId }: { interviewId: number }) {
  const router = useRouter();
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(
    null,
  );
  const { conversation, setConversation, scrollRef } = useConversation();
  const {
    InterviewerState,
    interviewerState,
    interviewerResponds,
    interviewerStops,
    terminateInterview,
  } = useInterviewer({
    interviewId,
    transcriptId: 1,
    interviewStartTime,
    setConversation,
  });

  const intervieweeResponds = (transcript: string) => {
    const intervieweeMessage: Message = {
      transcriptionId,
      role: "interviewee",
      content: transcript,
    };
    setConversation((prev) => [...prev, intervieweeMessage]);

    interviewerResponds({
      intervieweeResponse: transcript,
      numResponses: conversation.length / 2,
    });
  };

  useEffect(() => {
    setInterviewStartTime(Date.now());
  }, []);

  return (
    <div className="rounded-md bg-apriora-blue px-40 py-20">
      <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
        <ManagedWebcam
          interviewId={interviewId}
          interruptInterviewer={interviewerStops}
          intervieweeResponds={intervieweeResponds}
          interviewerIsSpeaking={interviewerState === InterviewerState.speaking}
          terminateInterview={terminateInterview}
        />

        <div className="flex h-full w-72 flex-col items-center justify-start gap-y-2 bg-gray-100">
          <div className="w-full border-b border-gray-400 px-10 pb-4 pt-6">
            <p className="text-center text-sm">Live Transcript</p>
          </div>
          <ul
            ref={scrollRef}
            className="flex w-full flex-1 flex-col items-start gap-y-3 overflow-y-scroll p-2"
          >
            {conversation.map((c, index) => (
              <div key={index} className="flex flex-col justify-start gap-y-1">
                {c.role === "interviewee" ? (
                  <>
                    <p className="text-sm font-medium">Scott</p>
                    <p className="rounded-md bg-gray-200 p-2 text-sm">
                      {c.content}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-right text-sm font-medium">Alex</p>
                    <p className="rounded-md bg-blue-400 p-2 text-sm">
                      {c.content}
                    </p>
                  </>
                )}
              </div>
            ))}
            <span className="flex w-full justify-center">
              {interviewerState === InterviewerState.thinking && (
                <ThreeDots color="gray" />
              )}
            </span>
          </ul>
        </div>
      </div>
    </div>
  );
}
