-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER') NOT NULL,
    `permissions` JSON NULL,
    `phone` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(191) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Historique` (
    `idHistorique` INTEGER NOT NULL AUTO_INCREMENT,
    `dateModification` DATETIME(3) NOT NULL,
    `descriptionAction` VARCHAR(191) NOT NULL,
    `acteur` VARCHAR(191) NULL,
    `utilisateurId` INTEGER NOT NULL,

    PRIMARY KEY (`idHistorique`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `idClient` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `numeroTelephone` VARCHAR(191) NOT NULL,
    `statut` ENUM('ACTIVE', 'BLACKLISTED') NOT NULL DEFAULT 'ACTIVE',
    `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Client_email_key`(`email`),
    UNIQUE INDEX `Client_numeroTelephone_key`(`numeroTelephone`),
    INDEX `Client_statut_nom_idClient_idx`(`statut`, `nom`, `idClient`),
    INDEX `Client_nom_idx`(`nom`),
    INDEX `Client_numeroTelephone_idx`(`numeroTelephone`),
    PRIMARY KEY (`idClient`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commentaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contenu` VARCHAR(191) NOT NULL,
    `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commande` (
    `idCommande` VARCHAR(191) NOT NULL,
    `dateCommande` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` VARCHAR(191) NOT NULL,
    `adresseLivraison` VARCHAR(191) NOT NULL,
    `montantTotal` DECIMAL(12, 2) NOT NULL,
    `clientId` INTEGER NOT NULL,

    INDEX `Commande_clientId_idx`(`clientId`),
    INDEX `Commande_dateCommande_idx`(`dateCommande`),
    PRIMARY KEY (`idCommande`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LigneCommande` (
    `idLigne` INTEGER NOT NULL AUTO_INCREMENT,
    `quantite` INTEGER NOT NULL,
    `prixUnitaire` DECIMAL(10, 2) NOT NULL,
    `commandeId` VARCHAR(191) NOT NULL,
    `produitId` VARCHAR(191) NOT NULL,

    INDEX `LigneCommande_commandeId_idx`(`commandeId`),
    INDEX `LigneCommande_produitId_idx`(`produitId`),
    UNIQUE INDEX `LigneCommande_commandeId_produitId_key`(`commandeId`, `produitId`),
    PRIMARY KEY (`idLigne`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produit` (
    `idProduit` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `prix` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL,
    `remise` DOUBLE NOT NULL,
    `marque` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `qrCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Produit_qrCode_key`(`qrCode`),
    PRIMARY KEY (`idProduit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fournisseur` (
    `idFournisseur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Fournisseur_telephone_key`(`telephone`),
    UNIQUE INDEX `Fournisseur_email_key`(`email`),
    PRIMARY KEY (`idFournisseur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Retour` (
    `idRetour` INTEGER NOT NULL AUTO_INCREMENT,
    `dateRetour` DATETIME(3) NOT NULL,
    `statutRetour` VARCHAR(191) NOT NULL,
    `raisonRetour` VARCHAR(191) NOT NULL,
    `commandeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Retour_commandeId_key`(`commandeId`),
    PRIMARY KEY (`idRetour`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `produitId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Notification_produitId_resolved_idx`(`produitId`, `resolved`),
    UNIQUE INDEX `Notification_produitId_type_key`(`produitId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accounting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `achatProduits` DECIMAL(8, 2) NOT NULL,
    `ads` DECIMAL(8, 2) NOT NULL,
    `emballage` DECIMAL(8, 2) NOT NULL,
    `salaires` DECIMAL(8, 2) NOT NULL,
    `abonnementTel` DECIMAL(8, 2) NOT NULL,
    `autre` DECIMAL(8, 2) NULL,
    `commentaire` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FournisseurProduit` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FournisseurProduit_AB_unique`(`A`, `B`),
    INDEX `_FournisseurProduit_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Historique` ADD CONSTRAINT `Historique_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commentaire` ADD CONSTRAINT `Commentaire_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`idClient`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`idClient`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LigneCommande` ADD CONSTRAINT `LigneCommande_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`idCommande`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LigneCommande` ADD CONSTRAINT `LigneCommande_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`idProduit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Retour` ADD CONSTRAINT `Retour_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`idCommande`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`idProduit`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FournisseurProduit` ADD CONSTRAINT `_FournisseurProduit_A_fkey` FOREIGN KEY (`A`) REFERENCES `Fournisseur`(`idFournisseur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FournisseurProduit` ADD CONSTRAINT `_FournisseurProduit_B_fkey` FOREIGN KEY (`B`) REFERENCES `Produit`(`idProduit`) ON DELETE CASCADE ON UPDATE CASCADE;
