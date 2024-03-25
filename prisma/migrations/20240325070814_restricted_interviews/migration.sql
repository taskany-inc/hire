-- CreateTable
CREATE TABLE "_InterviewAccessRestriction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InterviewAccessRestriction_AB_unique" ON "_InterviewAccessRestriction"("A", "B");

-- CreateIndex
CREATE INDEX "_InterviewAccessRestriction_B_index" ON "_InterviewAccessRestriction"("B");

-- AddForeignKey
ALTER TABLE "_InterviewAccessRestriction" ADD CONSTRAINT "_InterviewAccessRestriction_A_fkey" FOREIGN KEY ("A") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewAccessRestriction" ADD CONSTRAINT "_InterviewAccessRestriction_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
