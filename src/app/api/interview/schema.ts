import { z } from "zod";

export const interviewerStartSchema = z.object({
  introduction: z.string(),
});

export type InterviewerStart = z.infer<typeof interviewerStartSchema>;

export const interviewerResponseSchema = z.object({
  response: z.string(),
  terminate: z.boolean(),
});

export type InterviewerResponse = z.infer<typeof interviewerResponseSchema>;
