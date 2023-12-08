-- CreateTable
CREATE TABLE "ProblemHistory" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "previousValue" TEXT,
    "nextValue" TEXT,
    "userId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT "ProblemHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProblemHistory" ADD CONSTRAINT "ProblemHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemHistory" ADD CONSTRAINT "ProblemHistory_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
