"use client";

import { uploadRecording } from "~/actions/aws";
import { storeVideo } from "~/actions/interview";
import { RefObject, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

export function useVideoRecorder({
  interviewId,
  webcamRef,
}: {
  interviewId: number;
  webcamRef: RefObject<Webcam>;
}) {
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoBlobsRef = useRef<Blob[]>([]);

  const startVideoRecording = useCallback(() => {
    const stream = webcamRef.current?.stream;
    if (!stream) {
      toast.error("Webcam is unavailable");
      return;
    }

    videoRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });
    videoRecorderRef.current.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        videoBlobsRef.current.push(event.data);
      }
    });
    videoRecorderRef.current.start();
  }, [webcamRef]);

  const stopVideoRecording = useCallback(async () => {
    if (
      videoRecorderRef.current &&
      videoRecorderRef.current.state !== "inactive"
    ) {
      videoRecorderRef.current.stop();

      await new Promise<void>((res) => {
        videoRecorderRef.current!.addEventListener(
          "stop",
          async () => {
            const videoBlob = new Blob(videoBlobsRef.current, {
              type: "video/webm",
            });
            videoBlobsRef.current = [];

            const fileName = `recording_${Date.now()}.webm`;
            await uploadVideoInChunks(videoBlob, fileName);

            res();
          },
          { once: true },
        );
      });
    }
  }, []);

  async function uploadVideoInChunks(videoBlob: Blob, fileName: string) {
    // S3 Multipart minimum requirement
    const chunkSize = 5.1 * 1024 * 1024;
    const totalSize = videoBlob.size;
    const totalChunks = Math.ceil(totalSize / chunkSize);

    videoBlobsRef.current = [];
    let uploadId: string | undefined;
    let parts: { ETag: string; PartNumber: number }[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, totalSize);
      const chunk = videoBlob.slice(start, end);

      console.log(
        `Chunk ${i + 1}/${totalChunks}: ` +
          `start=${(start / 1_000_000).toFixed(2)}s, ` +
          `end=${(end / 1_000_000).toFixed(2)}s, ` +
          `size=${(chunk.size / (1024 * 1024)).toFixed(2)} MB`,
      );

      const arrayBuffer = await chunk.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([uint8Array], { type: "application/octet-stream" }),
        "chunk",
      );
      formData.append("fileName", fileName);
      formData.append("totalParts", totalChunks.toString());
      formData.append("partNumber", (i + 1).toString());
      if (uploadId) {
        formData.append("uploadId", uploadId);
      }
      if (parts.length > 0) {
        formData.append("parts", JSON.stringify(parts));
      }

      const result = await uploadRecording(formData);
      if (i == totalChunks - 1) {
        await storeVideo({ interviewId, fileName });
      }

      if (result.uploadId) {
        uploadId = result.uploadId;
      }
      if (result.parts) {
        parts = result.parts;
      }
    }

    console.log(`Uploaded ${fileName} in ${totalChunks} parts.`);
  }

  return { startVideoRecording, stopVideoRecording };
}
