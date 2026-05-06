/*
  Warnings:

  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Port` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_portId_fkey";

-- DropForeignKey
ALTER TABLE "Port" DROP CONSTRAINT "Port_departmentId_fkey";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "Port";

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "port_code" VARCHAR(50) NOT NULL,
    "department_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" VARCHAR(255) NOT NULL,
    "original" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "FileType" NOT NULL,
    "path" TEXT NOT NULL,
    "port_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ports_port_code_key" ON "ports"("port_code");

-- CreateIndex
CREATE INDEX "ports_department_id_idx" ON "ports"("department_id");

-- CreateIndex
CREATE INDEX "files_port_id_idx" ON "files"("port_id");

-- CreateIndex
CREATE INDEX "files_type_idx" ON "files"("type");

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
