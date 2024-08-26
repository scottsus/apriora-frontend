"use client";

import { formatTime } from "~/lib/utils";
import { messages } from "~/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

import { useVideoControl, Video } from "./video";

type Message = InferSelectModel<typeof messages>;

export function Replay({
  url,
  transcripts,
}: {
  url: string;
  transcripts: Message[];
}) {
  const { videoRef, jumpToTime } = useVideoControl();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-2">
      <Video url={url} ref={videoRef} />
      {transcripts.map((message) => (
        <p
          className="w-1/2 cursor-pointer rounded-md bg-gray-200 p-3 hover:bg-gray-100"
          onClick={() => jumpToTime(message.startTime / 1000)}
        >
          {formatTime(message.startTime)}: {message.content}
        </p>
      ))}
    </div>
  );
}
