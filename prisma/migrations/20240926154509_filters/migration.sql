-- CreateEnum
CREATE TYPE "FilterEntity" AS ENUM ('Candidate');

-- CreateTable
CREATE TABLE "Filter" (
    "id" TEXT NOT NULL,
    "entity" "FilterEntity" NOT NULL,
    "params" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
