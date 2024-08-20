"use client";

import { transcribeAudio } from "~/actions/transcribe";
import { webmToMp3 } from "~/lib/webmToMp3";
import { DoorOpenIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

import { Button } from "./button";

export function ManagedWebcam({
  interruptInterviewer,
  handleIntervieweeResponse,
  closeWebcam,
}: {
  interruptInterviewer: () => void;
  handleIntervieweeResponse: (response: string) => void;
  closeWebcam: () => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobsRef = useRef<Blob[] | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
  }, [webcamRef, mediaRecorderRef, setIsCapturing]);

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

  return (
    <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
      <div className="flex flex-col justify-center gap-y-4 rounded-lg bg-gray-900 p-4">
        <div className="overflow-hidden rounded-md">
          <Webcam audio muted ref={webcamRef} />
        </div>
        <div className="flex w-full items-center justify-center">
          {!isCapturing ? (
            <Button
              variant="primary"
              className="mx-auto w-1/3 flex-grow-0"
              onClick={handleResponseStart}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="mx-auto w-1/3 flex-grow-0"
              onClick={handleResponseStop}
            >
              Stop
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
