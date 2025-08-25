-- AlterTable
ALTER TABLE `commande` MODIFY `montantTotal` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `lignecommande` MODIFY `prixUnitaire` DECIMAL(10, 2) NOT NULL;
