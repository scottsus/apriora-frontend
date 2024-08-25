"use client";

import { recordInterviewerAudio } from "~/actions/audio";
import { textToMp3 } from "~/actions/speak";
import { interviewerResponseSchema } from "~/app/api/interview/schema";
import { base64ToBlob } from "~/lib/utils";
import { messages } from "~/server/db/schema";
import { experimental_useObject as useObject } from "ai/react";
import { InferInsertModel } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Message = InferInsertModel<typeof messages>;

export function useInterviewer({
  interviewId,
  transcriptId,
  interviewStartTime,
  setConversation,
}: {
  interviewId: number;
  transcriptId: number;
  interviewStartTime: number | null;
  setConversation: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  enum InterviewerState {
    listening,
    thinking,
    speaking,
  }

  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [terminateInterview, setTerminateInterview] = useState(false);
  const [interviewerState, setInterviewerState] = useState<InterviewerState>(
    InterviewerState.listening,
  );

  const { submit: interviewerResponds } = useObject({
    api: "/api/interview",
    schema: interviewerResponseSchema,
    onFinish({ object }) {
      const thoughts =
        object?.response ?? "Sorry, there was an error with the last response.";

      const interviewerMessage: Message = {
        transcriptionId: transcriptId,
        role: "interviewer",
        content: thoughts,
      };
      setConversation((prev) => [...prev, interviewerMessage]);

      _interviewerThinks(thoughts)
        .then((voice) => _interviewerSpeaks(voice))
        .then((res) => _recordInterviewerAudio(res))
        .then(() => {
          if (object?.terminate) {
            setTerminateInterview(true);
          }
        })
        .catch((err) => console.error("useInterviewer:", err));
    },
  });

  async function _interviewerThinks(thoughts: string) {
    setInterviewerState(InterviewerState.thinking);
    const base64Audio = await textToMp3(thoughts);
    if (!base64Audio) {
      throw new Error("Unable to synthesize interviewer's speech from text.");
    }

    return base64Audio;
  }

  async function _interviewerSpeaks(base64Audio: string) {
    const speechBlob = base64ToBlob(base64Audio);
    const url = URL.createObjectURL(speechBlob);
    audioRef.current = new Audio(url);

    return new Promise<{ speechBlob: Blob; relativeStartTime: number }>(
      (res) => {
        setInterviewerState(InterviewerState.speaking);
        const speakStartTime = Date.now();
        const relativeStartTime = interviewStartTime
          ? speakStartTime - interviewStartTime
          : 0;

        audioRef
          .current!.play()
          .then(() => {
            audioRef.current?.addEventListener("ended", () => {
              audioRef.current = null;
              setInterviewerState(InterviewerState.listening);
              res({ speechBlob, relativeStartTime });
            });
          })
          .catch((err) => {
            toast.error(`Error speaking: ${err}`);
            setInterviewerState(InterviewerState.listening);
            res({ speechBlob, relativeStartTime });
          });
      },
    );
  }

  async function _recordInterviewerAudio({
    speechBlob,
    relativeStartTime,
  }: {
    speechBlob: Blob;
    relativeStartTime: number;
  }) {
    const formData = new FormData();
    formData.append("interviewId", interviewId.toString());
    formData.append("audio", speechBlob);
    formData.append("relativeStartTime", relativeStartTime.toString());

    return await recordInterviewerAudio(formData);
  }

  function interviewerStops() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setInterviewerState(InterviewerState.listening);
  }

  return {
    InterviewerState,
    interviewerState,
    interviewerResponds,
    interviewerStops,
    terminateInterview,
  };
}
