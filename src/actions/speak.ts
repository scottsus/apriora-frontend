"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "tts-1";

/**
 * Given a written script, produce a blob that can be used to synthesize speech.
 * Because server actions don't allow passing of Blobs, we encode it in base64.
 * @param text script to speak aloud
 * @returns base64 string that must be converted back into a Blob client-side.
 */
export async function textToMp3(text: string): Promise<string | null> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: MODEL,
      voice: "alloy",
      input: text,
      speed: 1.14,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64 = buffer.toString("base64");

    return base64;
  } catch (err) {
    console.error("Unable to synthesize text into speech:", err);
    return null;
  }
}
