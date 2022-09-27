-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tokens" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User" USING HASH ("id");

-- CreateIndex
CREATE INDEX "User_uid_idx" ON "User" USING HASH ("uid");

-- CreateIndex
CREATE INDEX "User_tokens_idx" ON "User" USING HASH ("tokens");
