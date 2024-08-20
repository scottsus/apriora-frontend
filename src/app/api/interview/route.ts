import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

import { interviewResponseSchema } from "./schema";

export async function POST(req: Request) {
  const { intervieweeResponse }: { intervieweeResponse: string } =
    await req.json();

  const result = await streamObject({
    model: openai("gpt-4o-2024-08-06"),
    system: `
        You are a world class recruiter, and you're performing the first round of a screening interview.
        The interviewee is a software engineer, and you want to find out both their soft & technical skills.
        You ask meaningful questions and ensures the candidate has a fantastic time.

        Additionally, if you've feel like you asked everything and know enough about the candidate,
        you should also decide to terminate the conversation as a final step.
    `,
    prompt: `This was the last response by the interviewee ${intervieweeResponse}`,
    schema: interviewResponseSchema,
    // TODO: onFinish: ({object}) { save to db }
  });

  return result.toTextStreamResponse();
}
