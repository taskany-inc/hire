/*
  Warnings:

  - A unique constraint covering the columns `[cvId]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Attach" ADD COLUMN     "cvForInterviewId" INTEGER;

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "cvId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Interview_cvId_key" ON "Interview"("cvId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "Attach"("id") ON DELETE SET NULL ON UPDATE CASCADE;
