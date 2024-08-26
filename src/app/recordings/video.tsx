"use client";

import { forwardRef, useCallback, useRef } from "react";

export function useVideoControl() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const jumpToTime = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  return { videoRef, jumpToTime };
}

export const Video = forwardRef<HTMLVideoElement, { url: string }>(
  ({ url }, ref) => {
    return (
      <video ref={ref} controls>
        <source src={url} type="video/webm" />
      </video>
    );
  },
);

Video.displayName = "Video";
