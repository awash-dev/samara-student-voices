CREATE TABLE IF NOT EXISTS "privacy_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"user_email" text NOT NULL,
	"user_role" "role" NOT NULL,
	"consent" text NOT NULL,
	"source" text NOT NULL,
	"device" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cookies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"third_party" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"location" jsonb,
	"camera_snapshot" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "privacy_audits" ADD CONSTRAINT "privacy_audits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "privacy_audits_created_at_idx" ON "privacy_audits" USING btree ("created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "privacy_audits_user_id_idx" ON "privacy_audits" USING btree ("user_id");
