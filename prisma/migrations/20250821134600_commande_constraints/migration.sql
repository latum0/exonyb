/*
  Warnings:

  - You are about to alter the column `statut` on the `client` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - A unique constraint covering the columns `[commandeId,produitId]` on the table `LigneCommande` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `commande` DROP FOREIGN KEY `Commande_clientId_fkey`;

-- AlterTable
ALTER TABLE `client` MODIFY `statut` ENUM('ACTIVE', 'BLACKLISTED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `commande` MODIFY `dateCommande` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `montantTotal` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `lignecommande` MODIFY `prixUnitaire` DECIMAL(10, 2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `LigneCommande_commandeId_produitId_key` ON `LigneCommande`(`commandeId`, `produitId`);

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`idClient`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `commande` RENAME INDEX `Commande_clientId_fkey` TO `Commande_clientId_idx`;