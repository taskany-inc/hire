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
CREATE TABLE "AiAssistantOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "AiAssistantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AiAssistantToAiAssistantOption" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AiAssistant_name_key" ON "AiAssistant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AiAssistantToAiAssistantOption_AB_unique" ON "_AiAssistantToAiAssistantOption"("A", "B");

-- CreateIndex
CREATE INDEX "_AiAssistantToAiAssistantOption_B_index" ON "_AiAssistantToAiAssistantOption"("B");

-- AddForeignKey
ALTER TABLE "AppConfig" ADD CONSTRAINT "AppConfig_aiAssistantId_fkey" FOREIGN KEY ("aiAssistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AiAssistantToAiAssistantOption" ADD CONSTRAINT "_AiAssistantToAiAssistantOption_A_fkey" FOREIGN KEY ("A") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AiAssistantToAiAssistantOption" ADD CONSTRAINT "_AiAssistantToAiAssistantOption_B_fkey" FOREIGN KEY ("B") REFERENCES "AiAssistantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
