-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "AnalyticsEvent" ALTER COLUMN "timestamp" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Attach" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "CalendarEvent" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "CalendarEventCancellation" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "CalendarEventDetails" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "CalendarEventException" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Interview" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "InterviewEvent" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Reaction" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "SectionType" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Solution" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());

-- AlterTable
ALTER TABLE "VerificationRequest" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc'::text, now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc'::text, now());
