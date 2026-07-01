ALTER TABLE "transactions" DROP CONSTRAINT "amount_positive_check";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "amount_cents";--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "amount_positive_check" CHECK ("transactions"."amount" > 0);