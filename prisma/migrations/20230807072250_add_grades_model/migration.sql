-- CreateTable
CREATE TABLE "Grades" (
    "id" SERIAL NOT NULL,
    "options" TEXT[],

    CONSTRAINT "Grades_pkey" PRIMARY KEY ("id")
);
