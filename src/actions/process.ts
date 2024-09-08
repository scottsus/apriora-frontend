"use server";

export async function processRecordingOffline({
  interviewId,
}: {
  interviewId: number;
}) {
  const ffmpegProcessingUrl = process.env.FFMPEG_PROCESSING_URL ?? "url";

  const response = await fetch(
    `${ffmpegProcessingUrl}/process-multimedia?interview_id=${interviewId}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to process recording for interview ID ${interviewId}`,
    );
  }

  const result = await response.json();
  return result;
}
