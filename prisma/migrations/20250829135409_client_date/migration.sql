-- AlterTable
ALTER TABLE `client` ADD COLUMN `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `Client_statut_nom_idClient_idx` ON `Client`(`statut`, `nom`, `idClient`);

-- CreateIndex
CREATE INDEX `Client_nom_idx` ON `Client`(`nom`);

-- CreateIndex
CREATE INDEX `Client_numeroTelephone_idx` ON `Client`(`numeroTelephone`);

-- CreateIndex
CREATE INDEX `Commande_dateCommande_idx` ON `Commande`(`dateCommande`);
