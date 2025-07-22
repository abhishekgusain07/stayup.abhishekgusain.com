CREATE TABLE "alert_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"monitor_id" text NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"monitor_id" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"duration" integer,
	"error_message" text,
	"last_notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitor_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"monitor_id" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitor_results" (
	"id" text PRIMARY KEY NOT NULL,
	"monitor_id" text NOT NULL,
	"region" text NOT NULL,
	"status" text NOT NULL,
	"response_time" integer,
	"status_code" integer,
	"error_message" text,
	"checked_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"method" text DEFAULT 'GET' NOT NULL,
	"expected_status_codes" jsonb DEFAULT '[200,201,202,204]'::jsonb NOT NULL,
	"timeout" integer DEFAULT 30 NOT NULL,
	"interval" integer DEFAULT 5 NOT NULL,
	"retries" integer DEFAULT 2 NOT NULL,
	"headers" jsonb,
	"body" text,
	"slug" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_status" text DEFAULT 'PENDING' NOT NULL,
	"last_checked_at" timestamp,
	"last_incident_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "monitors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "alert_recipients" ADD CONSTRAINT "alert_recipients_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_logs" ADD CONSTRAINT "monitor_logs_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_results" ADD CONSTRAINT "monitor_results_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;