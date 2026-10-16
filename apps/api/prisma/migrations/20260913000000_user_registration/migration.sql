-- Legacy users remain unclassified and cannot authenticate until enrolled.
CREATE TYPE "UserType" AS ENUM ('colecionador', 'investidor');
ALTER TABLE "User" ADD COLUMN "type" "UserType", ADD COLUMN "passwordHash" TEXT;
-- Fail safely if legacy case-insensitive duplicates exist; never delete or merge users.
CREATE UNIQUE INDEX "User_email_normalized_key" ON "User" (lower(btrim("email")));
ALTER TABLE "User" ADD CONSTRAINT "User_registration_complete" CHECK (
  ("type" IS NULL AND "passwordHash" IS NULL) OR
  ("type" IS NOT NULL AND "passwordHash" IS NOT NULL)
);
