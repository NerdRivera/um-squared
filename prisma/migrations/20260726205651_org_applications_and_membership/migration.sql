/*
  Warnings:

  - Added the required column `contactInfo` to the `OrgApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrgApplication" ADD COLUMN     "contactInfo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
