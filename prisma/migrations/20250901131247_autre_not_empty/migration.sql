/*
  Warnings:

  - Made the column `autre` on table `accounting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `accounting` MODIFY `autre` DECIMAL(8, 2) NOT NULL;
