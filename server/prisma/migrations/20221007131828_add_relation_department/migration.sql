-- CreateTable
CREATE TABLE "Department" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" BIGINT NOT NULL,
    "description" TEXT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_id_idx" ON "Department" USING HASH ("id");

-- CreateIndex
CREATE INDEX "Department_managerId_idx" ON "Department" USING HASH ("managerId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
