ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "cookie_categories" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "device_permissions" jsonb DEFAULT '{}'::jsonb NOT NULL;
