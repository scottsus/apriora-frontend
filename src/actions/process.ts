"use server";

/**
 * TODO: Make a webhook?
 */
export async function processRecordingOffline({
  interviewId,
}: {
  interviewId: number;
}): Promise<void> {
  const ffmpegProcessingUrl = process.env.FFMPEG_PROCESSING_URL ?? "url";

  await fetch(
    `${ffmpegProcessingUrl}/process-multimedia?interview_id=${interviewId}`,
    {
      method: "POST",
    },
  );

  return;
}
