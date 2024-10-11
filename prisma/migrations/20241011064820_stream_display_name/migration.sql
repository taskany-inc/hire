/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `HireStream` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "HireStream" ADD COLUMN     "displayName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HireStream_name_key" ON "HireStream"("name");
