-- AlterTable
ALTER TABLE "Attach" ADD COLUMN     "commentId" TEXT;

-- AddForeignKey
ALTER TABLE "Attach" ADD CONSTRAINT "Attach_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
