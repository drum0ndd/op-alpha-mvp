-- Permanently remove only the retired account-classification metadata.
-- User rows, passwordHash, Session, preferredLens and UserLens are preserved.
-- Reversing the DDL cannot reconstruct each user's former classification.
-- Recovering those values requires a pre-migration backup; do not invent/backfill categories.
-- No CASCADE: unexpected dependencies must fail and roll back this entire migration.
BEGIN;

ALTER TABLE "User" DROP CONSTRAINT "User_registration_complete";
ALTER TABLE "User" DROP COLUMN "type";
DROP TYPE "UserType";

COMMIT;
