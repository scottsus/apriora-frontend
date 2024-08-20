DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('interviewer', 'interviewee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcription_id" integer NOT NULL,
	"role" "role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_transcriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewee" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_messages" ADD CONSTRAINT "apriora_messages_transcription_id_apriora_transcriptions_id_fk" FOREIGN KEY ("transcription_id") REFERENCES "public"."apriora_transcriptions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_id_idx" ON "apriora_messages" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transcriptions_id_idx" ON "apriora_transcriptions" USING btree ("id");