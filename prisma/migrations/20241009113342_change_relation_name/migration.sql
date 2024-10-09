/*
  Warnings:

  - You are about to drop the `_SectionInterviewers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SectionInterviewers" DROP CONSTRAINT "_SectionInterviewers_A_fkey";

-- DropForeignKey
ALTER TABLE "_SectionInterviewers" DROP CONSTRAINT "_SectionInterviewers_B_fkey";

-- DropTable
DROP TABLE "_SectionInterviewers";

-- CreateTable
CREATE TABLE "_SectionsToInterviewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SectionsToInterviewers_AB_unique" ON "_SectionsToInterviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_SectionsToInterviewers_B_index" ON "_SectionsToInterviewers"("B");

-- AddForeignKey
ALTER TABLE "_SectionsToInterviewers" ADD CONSTRAINT "_SectionsToInterviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SectionsToInterviewers" ADD CONSTRAINT "_SectionsToInterviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_SectionsToInterviewers" ("A", "B") SELECT "id", "interviewerId" FROM "Section"
