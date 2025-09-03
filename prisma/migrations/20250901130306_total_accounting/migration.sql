/*
  Warnings:

  - Added the required column `total` to the `Accounting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accounting` ADD COLUMN `total` DECIMAL(8, 2) NOT NULL;
