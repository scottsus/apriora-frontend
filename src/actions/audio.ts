"use server";

import { storeAudio } from "./postgres";
import { uploadAudio } from "./s3";

export async function recordInterviewerAudio(formData: FormData) {
  const interviewId = Number(formData.get("interviewId"));
  const audioFile = formData.get("audio") as File;
  const startTime = Number(formData.get("relativeStartTime"));
  if (!interviewId || !audioFile || !startTime) {
    throw new Error(
      `recordInterviewerAudio: missing interviewerId, audio file, or relative start time
        interviewerId: ${interviewId}, audioFile: ${audioFile}, startTime: ${startTime}
      `,
    );
  }

  const fileName = `${Date.now()}.webm`;
  await uploadAudio({ audioFile, fileName });
  await storeAudio({ interviewId, fileName, startTime });
}
