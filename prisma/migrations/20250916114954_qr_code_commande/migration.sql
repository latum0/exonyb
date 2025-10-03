/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Commande` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `commande` ADD COLUMN `qrCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Commande_qrCode_key` ON `Commande`(`qrCode`);
