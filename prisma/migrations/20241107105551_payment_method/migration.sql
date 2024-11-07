/*
  Warnings:

  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "paymentMethod" TEXT NOT NULL;
