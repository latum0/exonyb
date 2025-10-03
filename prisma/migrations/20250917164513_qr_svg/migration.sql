/*
  Warnings:

  - You are about to drop the column `qrCode` on the `commande` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Commande_qrCode_key` ON `commande`;

-- AlterTable
ALTER TABLE `commande` DROP COLUMN `qrCode`,
    MODIFY `qrSVG` LONGTEXT NULL;
