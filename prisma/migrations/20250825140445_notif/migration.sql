-- DropForeignKey
ALTER TABLE `commentaire` DROP FOREIGN KEY `Commentaire_clientId_fkey`;

-- DropIndex
DROP INDEX `Commentaire_clientId_fkey` ON `commentaire`;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `produitId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Notification_produitId_resolved_idx`(`produitId`, `resolved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Commentaire` ADD CONSTRAINT `Commentaire_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`idClient`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`idProduit`) ON DELETE RESTRICT ON UPDATE CASCADE;
