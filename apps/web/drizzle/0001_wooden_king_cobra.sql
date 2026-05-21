ALTER TABLE "analysis_requests" ADD COLUMN "cache_key_version" text;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "cache_key_hash" text;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "model_strategy" text;--> statement-breakpoint
ALTER TABLE "analysis_requests" ADD COLUMN "primary_model" text;--> statement-breakpoint
CREATE INDEX "analysis_requests_cache_idx" ON "analysis_requests" USING btree ("module_id","theme_slug","cache_key_version","cache_key_hash");