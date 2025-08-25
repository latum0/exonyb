-- DropForeignKey
ALTER TABLE `lignecommande` DROP FOREIGN KEY `LigneCommande_commandeId_fkey`;

-- DropForeignKey
ALTER TABLE `retour` DROP FOREIGN KEY `Retour_commandeId_fkey`;

-- AddForeignKey
ALTER TABLE `LigneCommande` ADD CONSTRAINT `LigneCommande_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`idCommande`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Retour` ADD CONSTRAINT `Retour_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`idCommande`) ON DELETE CASCADE ON UPDATE CASCADE;
