/*
  Warnings:

  - You are about to drop the column `sessionId` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[session_id,poll_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `session_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "votes_sessionId_poll_id_key";

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "sessionId",
ADD COLUMN     "session_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "votes_session_id_poll_id_key" ON "votes"("session_id", "poll_id");
