import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function calcTimeElapsed(startTime: number | null) {
  return startTime ? Date.now() - startTime : 0;
}

export function formatTime(ms: number): string {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64Content = reader.result.split(",")[1];
        base64Content
          ? res(base64Content)
          : rej(new Error("Failed to convert blob to base64"));
      } else {
        rej(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = rej;
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64Audio: string) {
  const binary = atob(base64Audio);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: "audio/mp3" });

  return blob;
}
