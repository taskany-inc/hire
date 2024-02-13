-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "delay" INTEGER,
    "retry" INTEGER,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "force" BOOLEAN NOT NULL DEFAULT false,
    "cron" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
