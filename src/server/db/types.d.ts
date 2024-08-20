import { InferSelectModel } from "drizzle-orm";

import {
  accounts,
  messages,
  posts,
  sessions,
  transcriptions,
  users,
  verificationTokens,
} from "./schema";

export type Post = InferSelectModel<typeof posts>;
export type User = InferSelectModel<typeof users>;
export type Account = InferSelectModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type Transcription = InferSelectModel<typeof transcriptions>;
export type Message = InferSelectModel<typeof messages>;
