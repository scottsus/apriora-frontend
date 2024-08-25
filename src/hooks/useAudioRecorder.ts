"use client";

import { transcribeAudio } from "~/actions/transcribe";
import { webmToMp3 } from "~/lib/webmToMp3";
import { RefObject, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

export function useAudioRecorder({
  onResponseStart,
  onResponseStop,
  recordTranscript,
  webcamRef,
}: {
  onResponseStart: () => void;
  onResponseStop: () => void;
  recordTranscript: (transcription: string) => void;
  webcamRef: RefObject<Webcam>;
}) {
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioBlobsRef = useRef<Blob[]>([]);

  const startAudioRecording = useCallback(() => {
    onResponseStart();

    const stream = webcamRef.current?.stream;
    if (!stream) {
      toast.error("Webcam is unavailable.");
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) {
      toast.error("Audio track unavailable. Will not save audio feed.");
      return;
    }

    const combinedStream = new MediaStream([audioTrack]);
    audioRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });
    audioRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable,
    );
    audioRecorderRef.current.start();
  }, [onResponseStart, webcamRef, audioRecorderRef]);

  const stopAudioRecording = useCallback(async () => {
    onResponseStop();

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      await new Promise<void>((resolve) => {
        audioRecorderRef.current!.addEventListener("stop", () => resolve(), {
          once: true,
        });
      });
    }

    if (!audioBlobsRef.current || audioBlobsRef.current.length === 0) {
      toast.error("No chunks recorded.");
      return;
    }

    const audioBlob = new Blob(audioBlobsRef.current, { type: "audio/webm" });
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

    recordTranscript(transcription);

    audioBlobsRef.current = [];
  }, [onResponseStop, audioRecorderRef, recordTranscript]);

  function handleDataAvailable({ data }: BlobEvent) {
    if (data.size === 0) return;
    if (audioBlobsRef.current) {
      audioBlobsRef.current.push(data);
    } else {
      audioBlobsRef.current = [data];
    }
  }

  return { startAudioRecording, stopAudioRecording };
}
