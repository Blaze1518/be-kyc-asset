/*
  Warnings:

  - Added the required column `updatedAt` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
