/*
  Warnings:

  - Made the column `description` on table `Department` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "Position" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE INDEX "Position_id_name_idx" ON "Position"("id", "name");
