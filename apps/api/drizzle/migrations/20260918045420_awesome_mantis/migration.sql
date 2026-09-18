CREATE TYPE "deployment_status" AS ENUM('success', 'failed', 'rolled_back');--> statement-breakpoint
CREATE TYPE "log_level" AS ENUM('INFO', 'WARN', 'ERROR');--> statement-breakpoint
CREATE TYPE "incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "incident_status" AS ENUM('open', 'investigating', 'resolved');--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"team" text,
	"repository" text,
	"environment" text DEFAULT 'production' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"service_id" uuid NOT NULL,
	"version" text NOT NULL,
	"commit_sha" text NOT NULL,
	"environment" text DEFAULT 'production' NOT NULL,
	"status" "deployment_status" NOT NULL,
	"deployed_at" timestamp with time zone NOT NULL,
	"changes" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"service_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"metric" text NOT NULL,
	"value" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"service_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"level" "log_level" NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "database_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"database" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"cpu" double precision NOT NULL,
	"connections" integer NOT NULL,
	"query_latency" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"service_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"severity" "incident_severity" NOT NULL,
	"status" "incident_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "deployments_service_id_deployed_at_idx" ON "deployments" ("service_id","deployed_at");--> statement-breakpoint
CREATE INDEX "metrics_service_id_metric_timestamp_idx" ON "metrics" ("service_id","metric","timestamp");--> statement-breakpoint
CREATE INDEX "logs_service_id_timestamp_idx" ON "logs" ("service_id","timestamp");--> statement-breakpoint
CREATE INDEX "database_metrics_database_timestamp_idx" ON "database_metrics" ("database","timestamp");--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id");