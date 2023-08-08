-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "AnalyticsEvent" ALTER COLUMN "timestamp" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Attach" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "CalendarEvent" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "CalendarEventCancellation" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "CalendarEventDetails" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "CalendarEventException" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Interview" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "InterviewEvent" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Reaction" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "SectionType" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Solution" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);

-- AlterTable
ALTER TABLE "VerificationRequest" ALTER COLUMN "createdAt" SET DEFAULT timezone('utc', current_timestamp),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('utc', current_timestamp);
