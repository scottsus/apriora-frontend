"use client";

import { cn } from "~/lib/utils";
import { forwardRef, useCallback, useEffect, useRef } from "react";

export function useVideoControl() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const jumpToTime = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const setPlaybackRate = (playbackRate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  };

  return { videoRef, jumpToTime, setPlaybackRate };
}

export const Video = forwardRef<
  HTMLVideoElement,
  { url: string; className: string }
>(({ url, className }, ref) => {
  return (
    <div className={cn("p-4", className)}>
      <div className="flex overflow-hidden rounded-lg">
        <video ref={ref} controls className="flex-1">
          <source src={url} type="video/webm" />
        </video>
      </div>
    </div>
  );
});

Video.displayName = "Video";
