-- CreateTable
CREATE TABLE "_InterviewAccessPermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InterviewAccessPermission_AB_unique" ON "_InterviewAccessPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_InterviewAccessPermission_B_index" ON "_InterviewAccessPermission"("B");

-- AddForeignKey
ALTER TABLE "_InterviewAccessPermission" ADD CONSTRAINT "_InterviewAccessPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewAccessPermission" ADD CONSTRAINT "_InterviewAccessPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
