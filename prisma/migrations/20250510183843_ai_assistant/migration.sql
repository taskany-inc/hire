-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN     "aiAssistantId" TEXT;

-- CreateTable
CREATE TABLE "AiAssistant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT "AiAssistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAssistantTopic" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "assistantId" TEXT,

    CONSTRAINT "AiAssistantTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAssistantFormat" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "assistantId" TEXT,

    CONSTRAINT "AiAssistantFormat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiAssistant_name_key" ON "AiAssistant"("name");

-- AddForeignKey
ALTER TABLE "AppConfig" ADD CONSTRAINT "AppConfig_aiAssistantId_fkey" FOREIGN KEY ("aiAssistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAssistantTopic" ADD CONSTRAINT "AiAssistantTopic_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAssistantFormat" ADD CONSTRAINT "AiAssistantFormat_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
