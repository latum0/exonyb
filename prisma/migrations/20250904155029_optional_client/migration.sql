-- AlterTable
ALTER TABLE `client` MODIFY `nom` VARCHAR(191) NULL,
    MODIFY `prenom` VARCHAR(191) NULL,
    MODIFY `adresse` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `statut` ENUM('ACTIVE', 'BLACKLISTED') NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX `Accounting_createdAt_idx` ON `Accounting`(`createdAt`);

-- CreateIndex
CREATE INDEX `Accounting_total_idx` ON `Accounting`(`total`);
