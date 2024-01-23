-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CalendarEventException" ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;
