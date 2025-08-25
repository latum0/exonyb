import { Prisma } from "@prisma/client";
import prisma from "../src/prisma";
import { ensureExists } from "./helpers";




export async function stockUpdate(tx: Prisma.TransactionClient, produitId: string, amount: number): Promise<void> {
    const produit = await ensureExists(() => tx.produit.findUnique({ where: { idProduit: produitId }, select: { stock: true } }), "Produit")
    const newStock = produit.stock - amount;
    await prisma.produit.update({ where: { idProduit: produitId }, data: { stock: newStock } })

}   