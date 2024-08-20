"use client";

import { transcribeAudio } from "~/actions/transcribe";
import { webmToMp3 } from "~/lib/webmToMp3";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

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
    <div className="flex flex-col items-center justify-center gap-y-3 overflow-hidden rounded-lg">
      <Webcam audio muted ref={webcamRef} />
      {!isCapturing ? (
        <button
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
          onClick={handleResponseStart}
        >
          Start
        </button>
      ) : (
        <button
          className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
          onClick={handleResponseStop}
        >
          Stop
        </button>
      )}
      <ul className="mx-auto mt-4 max-w-md space-y-2">
        {transcription.map((t, index) => (
          <li key={index} className="rounded-md bg-gray-100 p-2 shadow-sm">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
