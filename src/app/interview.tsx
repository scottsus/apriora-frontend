"use client";

import { textToMp3 } from "~/actions/speak";
import { ManagedWebcam } from "~/components/webcam";
import { InterviewState } from "~/lib/types";
import { messages } from "~/server/db/schema";
import { experimental_useObject as useObject } from "ai/react";
import { InferInsertModel } from "drizzle-orm";
import { useRef, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSynthesizingSpeech, setIsSynthesizingSpeech] = useState(false);

  const interviewerSpeaks = async (text: string) => {
    setIsSynthesizingSpeech(true);
    const base64Audio = await textToMp3(text);
    if (!base64Audio) {
      toast.error("Unable to synthesize interviewer's speech from text.");
      return;
    }
    setIsSynthesizingSpeech(false);

    const speechBlob = base64ToBlob(base64Audio);
    const url = URL.createObjectURL(speechBlob);
    audioRef.current = new Audio(url);
    audioRef.current
      .play()
      .then(() => {
        audioRef.current?.addEventListener("ended", () => {
          audioRef.current = null;
        });
      })
      .catch((err) => toast.error(`Error speaking: ${err}`));
  };

  const interviewerStops = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const { submit } = useObject({
    api: "/api/interview",
    schema: interviewResponseSchema,
    onFinish({ object }) {
      const interviewerTextResponse =
        object?.response ?? "Sorry, there was an error with the last response.";

      interviewerSpeaks(interviewerTextResponse);

      const interviewerMessage: Message = {
        transcriptionId,
        role: "interviewer",
        content: interviewerTextResponse,
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
          interruptInterviewer={interviewerStops}
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
            <span className="flex w-full justify-center">
              {isSynthesizingSpeech && <ThreeDots color="gray" />}
            </span>
          </ul>
        </div>
      </div>
    </div>
  );
}

function base64ToBlob(base64Audio: string) {
  const binary = atob(base64Audio);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: "audio/mp3" });

  return blob;
}
