CREATE TABLE IF NOT EXISTS "apriora_audios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" integer NOT NULL,
	"s3_url" text NOT NULL,
	"start_time" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewee" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" integer NOT NULL,
	"s3_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apriora_transcriptions" ADD COLUMN "interview_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_audios" ADD CONSTRAINT "apriora_audios_interview_id_apriora_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."apriora_interviews"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_videos" ADD CONSTRAINT "apriora_videos_interview_id_apriora_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."apriora_interviews"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interviews_id_idx" ON "apriora_interviews" USING btree ("id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_transcriptions" ADD CONSTRAINT "apriora_transcriptions_interview_id_apriora_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."apriora_interviews"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
