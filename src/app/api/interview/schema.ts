import { z } from "zod";

export const interviewResponseSchema = z.object({
  response: z.string(),
  terminate: z.boolean(),
});

export type InterviewResponse = z.infer<typeof interviewResponseSchema>;
