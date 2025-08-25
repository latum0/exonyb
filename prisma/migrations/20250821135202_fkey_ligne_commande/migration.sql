-- CreateIndex
CREATE INDEX `LigneCommande_commandeId_idx` ON `LigneCommande`(`commandeId`);

-- RenameIndex
ALTER TABLE `lignecommande` RENAME INDEX `LigneCommande_produitId_fkey` TO `LigneCommande_produitId_idx`;
