-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_interviewerId_fkey";

-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN     "interviewerIds" INTEGER[];

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "interviewerId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_SectionInterviewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SectionInterviewers_AB_unique" ON "_SectionInterviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_SectionInterviewers_B_index" ON "_SectionInterviewers"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionInterviewers" ADD CONSTRAINT "_SectionInterviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionInterviewers" ADD CONSTRAINT "_SectionInterviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_SectionInterviewers" ("A", "B") SELECT "id", "interviewerId" FROM "Section"