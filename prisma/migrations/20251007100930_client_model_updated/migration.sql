/*
  Warnings:

  - Made the column `nom` on table `client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prenom` on table `client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `client` MODIFY `nom` VARCHAR(191) NOT NULL,
    MODIFY `prenom` VARCHAR(191) NOT NULL;
