"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "whisper-1";

export async function transcribeAudio(formData: FormData): Promise<string> {
  try {
    const file = formData.get("audio") as File;
    if (!file) {
      throw new Error("Unable to provide transcription");
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: MODEL,
    });

    return transcription.text;
  } catch (err) {
    console.error("Transcription error:", err);
    return "";
  }
}
