-- DropForeignKey
ALTER TABLE "Attach" DROP CONSTRAINT "Attach_sectionId_fkey";

-- AlterTable
ALTER TABLE "Attach" ADD COLUMN     "interviewId" INTEGER,
ALTER COLUMN "sectionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Attach" ADD CONSTRAINT "Attach_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attach" ADD CONSTRAINT "Attach_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
