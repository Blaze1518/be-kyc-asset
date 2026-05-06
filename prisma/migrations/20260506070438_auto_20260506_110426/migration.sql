/*
  Warnings:

  - A unique constraint covering the columns `[action,subject]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "action" VARCHAR(50) NOT NULL,
ADD COLUMN     "subject" VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Port" (
    "id" TEXT NOT NULL,
    "portCode" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "FileType" NOT NULL,
    "path" TEXT NOT NULL,
    "portId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Port_portCode_key" ON "Port"("portCode");

-- CreateIndex
CREATE INDEX "Port_departmentId_idx" ON "Port"("departmentId");

-- CreateIndex
CREATE INDEX "File_portId_idx" ON "File"("portId");

-- CreateIndex
CREATE INDEX "File_type_idx" ON "File"("type");

-- CreateIndex
CREATE INDEX "permission_conditions_permission_id_attribute_id_idx" ON "permission_conditions"("permission_id", "attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_subject_key" ON "permissions"("action", "subject");

-- AddForeignKey
ALTER TABLE "Port" ADD CONSTRAINT "Port_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE CASCADE ON UPDATE CASCADE;
