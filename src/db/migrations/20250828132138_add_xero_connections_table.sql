CREATE TABLE "xero_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portal_id" varchar(16) NOT NULL,
	"access_token" varchar(2048) NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"status" boolean DEFAULT false NOT NULL,
	"initiated_by" uuid NOT NULL,
	"auth_event_id" uuid NOT NULL,
	"tenant_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
