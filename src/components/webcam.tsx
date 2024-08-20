"use client";

import { transcribeAudio } from "~/actions/transcribe";
import { useAudioAnalyzer } from "~/hooks/useAudioAnalyzer";
import { cn } from "~/lib/utils";
import { webmToMp3 } from "~/lib/webmToMp3";
import { DoorOpenIcon, PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import Webcam from "react-webcam";
import { toast } from "sonner";

import { Button } from "./button";

export function ManagedWebcam({
  interruptInterviewer,
  handleIntervieweeResponse,
  interviewerIsSpeaking,
  closeWebcam,
}: {
  interruptInterviewer: () => void;
  handleIntervieweeResponse: (response: string) => void;
  interviewerIsSpeaking: boolean;
  closeWebcam: () => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobsRef = useRef<Blob[] | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const handleResponseStart = useCallback(() => {
    setIsCapturing(true);
    interruptInterviewer();

    const stream = webcamRef.current?.stream;
    if (!stream) {
      toast.error("Webcam is unavailable.");
      return;
    }

    const [audioTrack, videoTrack] = [
      stream.getAudioTracks()[0],
      stream.getVideoTracks()[0],
    ];

    if (!audioTrack || !videoTrack) {
      toast.error(
        "Audio or video track unavailable. Will not save video feed.",
      );
      return;
    }

    const combinedStream = new MediaStream([audioTrack, videoTrack]);
    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable,
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, mediaRecorderRef, setIsCapturing, interruptInterviewer]);

  const handleDataAvailable = ({ data }: BlobEvent) => {
    if (data.size === 0) return;
    if (blobsRef.current) {
      blobsRef.current.push(data);
    } else {
      blobsRef.current = [data];
    }
  };

  const handleResponseStop = useCallback(async () => {
    setIsCapturing(false);

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      await new Promise<void>((resolve) => {
        mediaRecorderRef.current!.addEventListener("stop", () => resolve(), {
          once: true,
        });
      });
    }

    if (!blobsRef.current || blobsRef.current.length === 0) {
      toast.error("No chunks recorded.");
      return;
    }

    // TODO: Save this blob in the cloud
    // const videoBlob = new Blob(contentChunks, { type: "video/webm" });

    const audioBlob = new Blob(blobsRef.current, { type: "audio/webm" });
    const audioFile = new File([audioBlob], "audio.webm", {
      type: "audio/webm",
    });
    const mp3File = await webmToMp3(audioFile);

    const formData = new FormData();
    formData.append("audio", mp3File, "audio.mp3");

    const transcription = await transcribeAudio(formData);
    if (!transcription) {
      toast.error("Unable to transcribe audio.");
      return;
    }

    handleIntervieweeResponse(transcription);
    blobsRef.current = null;
  }, [mediaRecorderRef, setIsCapturing, handleIntervieweeResponse]);

  useAudioAnalyzer({
    webcamRef,
    isStreamReady,
    isCapturing,
    onResponseStart: handleResponseStart,
    onResponseStop: handleResponseStop,
  });

  return (
    <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
      <div className="flex flex-col justify-center gap-y-4 rounded-lg bg-gray-900 p-4">
        <div className="relative overflow-hidden rounded-md">
          <Webcam
            audio
            muted
            ref={webcamRef}
            onUserMedia={() => setIsStreamReady(true)}
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
              variant="secondary"
              className="mx-auto flex flex-grow-0 items-center"
              onClick={handleResponseStart}
            >
              <PlayIcon size={30} />
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="mx-auto flex flex-grow-0 items-center"
              onClick={handleResponseStop}
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
