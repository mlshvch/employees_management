/*
  Warnings:

  - Made the column `description` on table `Department` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "Employee" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "staffMember" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" BIGINT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Employee_id_idx" ON "Employee" USING HASH ("id");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee" USING HASH ("userId");

-- CreateIndex
CREATE INDEX "Employee_name_surname_idx" ON "Employee"("name", "surname");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
