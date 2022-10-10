/*
  Warnings:

  - You are about to drop the column `position` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `positionId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "position",
ADD COLUMN     "positionId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
