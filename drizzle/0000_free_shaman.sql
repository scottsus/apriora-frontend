DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('interviewer', 'interviewee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "apriora_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_audios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" integer NOT NULL,
	"s3_file_name" text NOT NULL,
	"start_time" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewee" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" integer NOT NULL,
	"role" "role" NOT NULL,
	"content" text NOT NULL,
	"start_time" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "apriora_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apriora_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" integer NOT NULL,
	"s3_file_name" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_account" ADD CONSTRAINT "apriora_account_user_id_apriora_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."apriora_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_audios" ADD CONSTRAINT "apriora_audios_interview_id_apriora_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."apriora_interviews"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_messages" ADD CONSTRAINT "apriora_messages_interview_id_apriora_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."apriora_interviews"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_post" ADD CONSTRAINT "apriora_post_created_by_apriora_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."apriora_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apriora_session" ADD CONSTRAINT "apriora_session_user_id_apriora_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."apriora_user"("id") ON DELETE no action ON UPDATE no action;
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
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "apriora_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interviews_id_idx" ON "apriora_interviews" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_id_idx" ON "apriora_messages" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_by_idx" ON "apriora_post" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "apriora_post" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "apriora_session" USING btree ("user_id");