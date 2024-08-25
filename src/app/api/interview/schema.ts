import { z } from "zod";

export const interviewerResponseSchema = z.object({
  response: z.string(),
  terminate: z.boolean(),
});

export type InterviewerResponse = z.infer<typeof interviewerResponseSchema>;
