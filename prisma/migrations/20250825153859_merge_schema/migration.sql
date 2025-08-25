/*
  Warnings:

  - You are about to drop the column `image` on the `produit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrCode]` on the table `Produit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `images` to the `Produit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrCode` to the `Produit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Produit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produit` DROP COLUMN `image`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `images` JSON NOT NULL,
    ADD COLUMN `qrCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `description` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Produit_qrCode_key` ON `Produit`(`qrCode`);
