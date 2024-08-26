"use client";

import { useAudioAnalyzer } from "~/hooks/useAudioAnalyzer";
import { useAudioRecorder } from "~/hooks/useAudioRecorder";
import { useVideoRecorder } from "~/hooks/useVideoRecorder";
import { calcTimeElapsed, cn } from "~/lib/utils";
import { DoorOpenIcon, PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import Webcam from "react-webcam";

import { Button } from "../../components/button";

export function ManagedWebcam({
  interviewId,
  interviewStartTime,
  intervieweeResponds,
  interruptInterviewer,
  interviewerIsSpeaking,
  terminateInterview,
}: {
  interviewId: number;
  interviewStartTime: number | null;
  intervieweeResponds: (transcript: string, startTime: number) => void;
  interruptInterviewer: () => void;
  interviewerIsSpeaking: boolean;
  terminateInterview: boolean;
}) {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const { startVideoRecording, stopVideoRecording, uploadVideo } =
    useVideoRecorder({
      interviewId,
      webcamRef,
    });
  const { startAudioRecording, stopAudioRecording } = useAudioRecorder({
    onResponseStart: (
      setStartTime: React.Dispatch<React.SetStateAction<number>>,
    ) => {
      const DELAY = 1000;
      setStartTime(calcTimeElapsed(interviewStartTime) + DELAY);
      setIsCapturing(true);
      interruptInterviewer();
    },
    onResponseStop: () => {
      setIsCapturing(false);
    },
    recordTranscript: intervieweeResponds,
    webcamRef,
  });

  useAudioAnalyzer({
    webcamRef,
    streamReady,
    isCapturing,
    onResponseStart: startAudioRecording,
    onResponseStop: stopAudioRecording,
  });

  async function closeWebcam() {
    interruptInterviewer();
    await stopVideoRecording()
      .then((blob) => {
        if (!blob) {
          throw new Error("No video blob found");
        }
        uploadVideo(blob);
      })
      .catch((err) => console.error("webcam:", err));

    router.push(`/recordings/${interviewId}`);
  }

  useEffect(() => {
    if (streamReady) {
      startVideoRecording();
    }
  }, [streamReady]);

  useEffect(() => {
    if (terminateInterview) {
      closeWebcam();
    }
  }, [terminateInterview]);

  return (
    <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
      <div className="flex flex-col justify-center gap-y-4 rounded-lg bg-gray-900 p-4">
        <div className="relative overflow-hidden rounded-md">
          <Webcam
            audio
            muted
            ref={webcamRef}
            onUserMedia={() => setStreamReady(true)}
          />

          <div
            className={cn(
              "absolute bottom-2 right-2 z-10 rounded-lg p-1",
              interviewerIsSpeaking && "bg-white",
            )}
          >
            <div className="relative flex h-24 w-24 flex-col items-center justify-between rounded-lg bg-gray-800 p-3">
              <Image
                src="/alex.png"
                alt="Alex"
                width={50}
                height={50}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex h-4 w-full items-center justify-between">
                <p className="text-xs text-white">Alex</p>
                {interviewerIsSpeaking && <Bars width={20} color="white" />}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          {!isCapturing ? (
            <Button
              variant="tertiary"
              className="mx-auto flex flex-grow-0 items-center"
              onClick={startAudioRecording}
            >
              <PlayIcon size={30} />
            </Button>
          ) : (
            <Button
              variant="tertiary"
              className="mx-auto flex flex-grow-0 items-center"
              onClick={stopAudioRecording}
            >
              <PauseIcon size={30} />
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-16 flex-grow-0"
            onClick={closeWebcam}
          >
            <DoorOpenIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
