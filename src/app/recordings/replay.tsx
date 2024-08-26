"use client";

import { useTranscriptSync } from "~/hooks/useTranscripts";
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
  const { transcriptRef, isCurrentTranscript } = useTranscriptSync(
    videoRef,
    transcripts,
  );

  return (
    <div className="rounded-md bg-apriora-blue px-40 py-20">
      <div className="flex h-[32rem] items-center overflow-hidden rounded-lg bg-gray-900">
        <Video url={url} ref={videoRef} className="" />

        <div className="flex h-full w-72 flex-col items-center justify-start gap-y-2 bg-gray-100">
          <div className="w-full border-b border-gray-400 px-10 pb-4 pt-6">
            <p className="text-center text-sm">Live Transcript</p>
          </div>
          <ul
            ref={transcriptRef}
            className="flex w-full flex-1 flex-col items-start gap-y-3 overflow-y-scroll p-2"
          >
            {transcripts.map((c, index) => (
              <div key={index} className="flex flex-col justify-start gap-y-1">
                {c.role === "interviewee" ? (
                  <div>
                    <p className="text-sm font-medium">Scott</p>
                    <p
                      data-start-time={c.startTime}
                      className={`cursor-pointer rounded-md bg-gray-200 p-2 text-sm transition-all hover:brightness-110 ${
                        isCurrentTranscript(index)
                          ? "ring-2 ring-yellow-400"
                          : ""
                      }`}
                      onClick={() => jumpToTime(c.startTime / 1000)}
                    >
                      {formatTime(c.startTime)}: {c.content}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-right text-sm font-medium">Alex</p>
                    <p
                      data-start-time={c.startTime}
                      className={`cursor-pointer rounded-md bg-blue-400 p-2 text-sm transition-all hover:brightness-110 ${
                        isCurrentTranscript(index)
                          ? "ring-2 ring-yellow-400"
                          : ""
                      }`}
                      onClick={() => jumpToTime(c.startTime / 1000)}
                    >
                      {formatTime(c.startTime)}: {c.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
