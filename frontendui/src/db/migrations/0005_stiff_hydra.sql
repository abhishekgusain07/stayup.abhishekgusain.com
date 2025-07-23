CREATE TYPE "public"."subscription_plan" AS ENUM('BASIC', 'PREMIUM', 'ENTERPRISE');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "subscription" SET DATA TYPE subscription_plan;