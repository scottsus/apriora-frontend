"use client";

import { transcribeAudio } from "~/actions/transcribe";
import { webmToMp3 } from "~/lib/webmToMp3";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

import { Button } from "./button";

export function ManagedWebcam() {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const blobsRef = useRef<Blob[] | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);

  const handleResponseStart = useCallback(() => {
    setIsCapturing(true);

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

    setTranscription((prev) => [...prev, transcription]);
    blobsRef.current = null;
  }, [mediaRecorderRef, setIsCapturing]);

  return (
    <div className="flex h-[36rem] items-center overflow-hidden rounded-lg bg-gray-900">
      <div className="flex flex-col justify-center gap-y-4 rounded-lg bg-gray-900 p-4">
        <div className="overflow-hidden rounded-md">
          <Webcam audio muted ref={webcamRef} />
        </div>
        {!isCapturing ? (
          <Button
            variant="primary"
            className="mx-auto w-1/3"
            onClick={handleResponseStart}
          >
            Start
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="mx-auto w-1/3"
            onClick={handleResponseStop}
          >
            Stop
          </Button>
        )}
      </div>

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
  );
}
