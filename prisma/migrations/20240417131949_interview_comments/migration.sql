-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_problemId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "interviewId" INTEGER,
ALTER COLUMN "problemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
