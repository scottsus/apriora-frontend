import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

import { interviewerStartSchema } from "../schema";

export async function POST(req: Request) {
  const result = await streamObject({
    model: openai("gpt-4o-2024-08-06"),
    system: `
        This is an AI interview. You are Alex, the AI interviewer.
        You are interviewing an interviewee in a screening call, and you want to know more about their skills and experiences.
        Start by introducing yourself, and this interview, then ask the interviewee or his/her name.
    `,
    prompt: "Hello there",
    schema: interviewerStartSchema,
  });

  return result.toTextStreamResponse();
}
