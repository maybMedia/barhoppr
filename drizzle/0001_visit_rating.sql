-- Existing visits keep a NULL rating. New visits require a 1–5 rating in the API.
ALTER TABLE "pubLog" ADD COLUMN "rating" integer CHECK ("rating" BETWEEN 1 AND 5);
