"use server";

import { db } from "~/server/db";
import {
  audios,
  interviews,
  messages,
  recordings,
  videos,
} from "~/server/db/schema";
import { eq, InferInsertModel } from "drizzle-orm";

export async function startInterview({ interviewee }: { interviewee: string }) {
  const [res] = await db.insert(interviews).values({ interviewee }).returning();

  return res;
}

export async function getRecording({ interviewId }: { interviewId: number }) {
  const [res] = await db
    .select()
    .from(recordings)
    .where(eq(recordings.interviewId, interviewId));

  return res;
}

export async function getVideo({ interviewId }: { interviewId: number }) {
  const [res] = await db
    .select()
    .from(videos)
    .where(eq(videos.interviewId, interviewId));

  return res;
}

export async function getAudios({ interviewId }: { interviewId: number }) {
  const res = await db
    .select()
    .from(audios)
    .where(eq(audios.interviewId, interviewId));

  return res;
}

export async function storeRecording({
  interviewId,
  fileName,
}: {
  interviewId: number;
  fileName: string;
}) {
  await db.insert(recordings).values({
    interviewId,
    s3FileName: fileName,
  });

  return fileName;
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

type Message = InferInsertModel<typeof messages>;

export async function storeMessage(message: Message) {
  await db.insert(messages).values(message);
}

export async function getTranscript({ interviewId }: { interviewId: number }) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.interviewId, interviewId));
}
