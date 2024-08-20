"use client";

import { ManagedWebcam } from "~/components/webcam";
import { InterviewState } from "~/lib/types";
import { messages } from "~/server/db/schema";
import { experimental_useObject as useObject } from "ai/react";
import { InferInsertModel } from "drizzle-orm";
import { useState } from "react";
import { toast } from "sonner";

import { interviewResponseSchema } from "./api/interview/schema";

const transcriptionId = 1; // TODO: Use DB

type Message = InferInsertModel<typeof messages>;

export function Interview({
  setInterviewState,
}: {
  setInterviewState: React.Dispatch<React.SetStateAction<InterviewState>>;
}) {
  const [conversation, setConversation] = useState<Message[]>([]);

  const { submit } = useObject({
    api: "/api/interview",
    schema: interviewResponseSchema,
    onFinish({ object }) {
      const interviewerMessage: Message = {
        transcriptionId,
        role: "interviewer",
        content:
          object?.response ?? "Unable to transcribe interviewer response.",
      };
      setConversation((prev) => [...prev, interviewerMessage]);

      if (object?.terminate) {
        toast.info("Interview complete. Thank you for your time.");
        endInterview();
      }
    },
  });

  const handleIntervieweeResponse = (intervieweeResponse: string) => {
    const intervieweeMessage: Message = {
      transcriptionId,
      role: "interviewee",
      content: intervieweeResponse,
    };
    submit({ intervieweeResponse });
    setConversation((prev) => [...prev, intervieweeMessage]);
  };

  const endInterview = () => setInterviewState(InterviewState.completed);

  return (
    <div className="bg-apriora-blue px-40 py-20">
      <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
        <ManagedWebcam
          handleIntervieweeResponse={handleIntervieweeResponse}
          closeWebcam={endInterview}
        />

        <div className="flex h-full w-72 flex-col items-center justify-start gap-y-2 bg-gray-100">
          <div className="w-full border-b border-gray-400 px-10 pb-4 pt-6">
            <p className="text-center text-sm">Live Transcript</p>
          </div>
          <ul className="flex w-full flex-1 flex-col items-start gap-y-3 overflow-y-scroll p-2">
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
          </ul>
        </div>
      </div>
    </div>
  );
}
