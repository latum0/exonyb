/*
  Warnings:

  - A unique constraint covering the columns `[produitId,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_produitId_fkey`;

-- CreateIndex
CREATE UNIQUE INDEX `Notification_produitId_type_key` ON `Notification`(`produitId`, `type`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`idProduit`) ON DELETE CASCADE ON UPDATE CASCADE;
