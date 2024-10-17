-- AlterTable
ALTER TABLE "Attach" ADD COLUMN     "problemId" INTEGER;

-- AddForeignKey
ALTER TABLE "Attach" ADD CONSTRAINT "Attach_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
