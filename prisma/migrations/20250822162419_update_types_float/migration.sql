/*
  Warnings:

  - You are about to alter the column `montantTotal` on the `commande` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Double`.
  - You are about to alter the column `prixUnitaire` on the `lignecommande` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.

*/
-- AlterTable
ALTER TABLE `commande` MODIFY `montantTotal` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `lignecommande` MODIFY `prixUnitaire` DOUBLE NOT NULL;
