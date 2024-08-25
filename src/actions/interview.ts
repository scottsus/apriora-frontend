"use server";

import { db } from "~/server/db";
import { audios, interviews, videos } from "~/server/db/schema";

export async function startInterview() {
  const [res] = await db
    .insert(interviews)
    .values({
      interviewee: "scott",
    })
    .returning({ id: interviews.id });

  return res?.id;
}

export async function storeVideo({
  interviewId,
  fileName,
}: {
  interviewId: number;
  fileName: string;
}) {
  await db.insert(videos).values({
    interviewId,
    s3FileName: fileName,
  });
}

export async function storeAudio({
  interviewId,
  fileName,
  startTime,
}: {
  interviewId: number;
  fileName: string;
  startTime: number;
}) {
  await db.insert(audios).values({
    interviewId,
    s3FileName: fileName,
    startTime: startTime,
  });
}
