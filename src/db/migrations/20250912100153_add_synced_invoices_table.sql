CREATE TYPE "public"."synced_invoices_status" AS ENUM('pending', 'failed', 'success');
CREATE TABLE "synced_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portal_id" varchar(16) NOT NULL,
	"copilot_invoice_id" varchar(64) NOT NULL,
	"xero_invoice_id" uuid,
	"status" "synced_invoices_status" DEFAULT 'pending' NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "uq_synced_invoices_portal_id_copilot_invoice_id" ON "synced_invoices" USING btree ("portal_id","copilot_invoice_id");