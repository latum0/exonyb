import prisma from "../prisma";
import { ensureExists } from "../utils/helpers";
import { UpdatePrixUnitaireLigneDto } from "../dto/ligneCommande.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { LigneCommande, Prisma } from "@prisma/client";
import { LigneResponseDto } from "../dto/response.dto";
import { createHistoriqueService } from "./historique.service";
import { createStockNotificationsIfNeeded, restockNotification } from "./notification.service";
export async function addLigne(
    tx: Prisma.TransactionClient,
    commandeId: string,
    produitId: string,
    quantite: number,
    utilisateurId?: number
) {
    if (!Number.isInteger(quantite) || quantite <= 0) throw new BadRequestError('Quantité invalide');

    const prod = await tx.produit.findUnique({ where: { idProduit: produitId } });
    if (!prod) throw new NotFoundError('Produit');

    const existing = await tx.ligneCommande.findFirst({ where: { commandeId, produitId } });
    if (existing) {
        await updateLigneQuantity(tx, produitId, commandeId, existing.quantite + quantite, utilisateurId);
        return;
    }

    const res = await tx.produit.updateMany({
        where: { idProduit: produitId, stock: { gte: quantite } },
        data: { stock: { decrement: quantite } }
    });
    if (res.count === 0) throw new BadRequestError('Stock insuffisant');

    const prixStr = (Number(prod.prix)).toFixed(2);
    await tx.ligneCommande.create({
        data: {
            commandeId,
            produitId,
            quantite,
            prixUnitaire: prixStr
        }
    });

    if (utilisateurId) {
        await createHistoriqueService(tx, utilisateurId, `Ajout produit ${produitId} (x${quantite}) à la commande ${commandeId}`);
    }

    try {
        await createStockNotificationsIfNeeded(tx, [produitId], { trigger: `addLigne:${commandeId}`, utilisateurId });
    } catch (err) {
        console.error("Notification creation failed (addLigne)", err);
    }
}



async function findCmdLine(tx: Prisma.TransactionClient, produitId: string, commandeId: string) {
    const line = await ensureExists(() => tx.ligneCommande.findFirst({
        where: {
            produitId,
            commandeId
        }
    }), "Ligne Commande")
    const cmd = await ensureExists(() => tx.commande.findUnique({ where: { idCommande: commandeId } }), "Commande")
    return { line, cmd }

}

export async function calcMontantT(tx: Prisma.TransactionClient, commandeId: string) {
    const lines = await tx.ligneCommande.findMany({ where: { commandeId } });
    const totalDecimal = lines.reduce((acc, l) => {
        return acc.add(new Prisma.Decimal(l.prixUnitaire).mul(l.quantite));
    }, new Prisma.Decimal(0));
    return totalDecimal;
}
export async function updateLigneQuantity(
    tx: Prisma.TransactionClient,
    produitId: string,
    commandeId: string,
    quantity: number,
    utilisateurId?: number
): Promise<void> {

    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestError("Quantité invalide");
    }

    const { line } = await findCmdLine(tx, produitId, commandeId);
    await ensureExists(() => tx.produit.findUnique({ where: { idProduit: produitId } }), "Produit");

    const oldQuantity = line.quantite;
    const delta = quantity - oldQuantity;

    if (delta > 0) {
        const res = await tx.produit.updateMany({
            where: { idProduit: produitId, stock: { gte: delta } },
            data: { stock: { decrement: delta } }
        });
        if (res.count === 0) throw new BadRequestError("Stock insuffisant pour le produit " + produitId);

        try {
            await createStockNotificationsIfNeeded(tx, [produitId], { trigger: `updateLigne:${commandeId}`, utilisateurId });
        } catch (err) {
            console.error("Notification creation failed (updateLigneQuantity)", err);
        }
    } else if (delta < 0) {
        await tx.produit.update({
            where: { idProduit: produitId },
            data: { stock: { increment: -delta } }
        });

        try {
            await restockNotification(tx, [produitId]);
        } catch (err) {
            console.error("Notification resolving failed (updateLigneQuantity)", err);
        }
    }

    await tx.ligneCommande.update({
        where: { idLigne: line.idLigne },
        data: { quantite: quantity }
    });
}

export async function updateLignePrixUnitaire(
    idLigne: number,
    dto: UpdatePrixUnitaireLigneDto,
    utilisateurId: number
): Promise<ServiceResponse<LigneResponseDto>> {

    const updated = await prisma.$transaction(async (tx) => {
        const ligne = await ensureExists(() =>
            tx.ligneCommande.findUnique({
                where: { idLigne },
                select: { idLigne: true, commandeId: true, prixUnitaire: true, quantite: true, produitId: true }
            }),
            "Ligne Commande"
        );

        let prixDec: Prisma.Decimal;
        try {
            prixDec = new Prisma.Decimal(dto.prixUnitaire).toDecimalPlaces(2);
            if (prixDec.lte(0)) throw new Error('prix <= 0');
        } catch {
            throw new BadRequestError('Prix unitaire invalide');
        }

        const updateLine = await tx.ligneCommande.update({
            where: { idLigne },
            data: { prixUnitaire: prixDec.toFixed(2) }
        });

        const totalDecimal = await calcMontantT(tx, ligne.commandeId);
        await tx.commande.update({
            where: { idCommande: ligne.commandeId },
            data: { montantTotal: totalDecimal.toFixed(2) }
        });

        await createHistoriqueService(
            tx,
            utilisateurId,
            `Prix unitaire modifié pour commande ${ligne.commandeId}, produit ${ligne.produitId}: ${String(ligne.prixUnitaire)} -> ${prixDec.toFixed(2)}`
        );

        return updateLine;
    });

    const responseDto: LigneResponseDto = {
        idLigne: updated.idLigne,
        quantite: updated.quantite,
        prixUnitaire: updated.prixUnitaire.toString()
    };
    return { statusCode: 200, data: responseDto };
}




export async function getLigneById(idLigne: number): Promise<ServiceResponse<LigneCommande>> {
    const line = await ensureExists(() => prisma.ligneCommande.findUnique({ where: { idLigne } }), "Ligne Commande");
    return { statusCode: 200, data: line }
}

export async function getLignesByCommande(commandeId: string): Promise<ServiceResponse<LigneCommande[]>> {
    await ensureExists(() => prisma.commande.findUnique({
        where: { idCommande: commandeId }
    }), "Commande")
    const lignes = await ensureExists(() => prisma.ligneCommande.findMany({
        where: { commandeId },
        select: { idLigne: true, produitId: true, quantite: true, prixUnitaire: true, commandeId: true }
    }), "Ligne Commande")
    if (lignes === null) {
        throw new NotFoundError("no order")
    }

    return { statusCode: 200, data: lignes };
}

export async function removeLigne(
    tx: Prisma.TransactionClient,
    commandeId: string,
    produitId: string,
    utilisateurId?: number
) {
    const line = await tx.ligneCommande.findFirst({ where: { commandeId, produitId } });
    if (!line) throw new NotFoundError('Ligne');

    await tx.produit.update({
        where: { idProduit: produitId },
        data: { stock: { increment: line.quantite } }
    });

    await tx.ligneCommande.delete({ where: { idLigne: line.idLigne } });

    if (utilisateurId) {
        await createHistoriqueService(tx, utilisateurId, `Suppression produit ${produitId} (x${line.quantite}) de la commande ${commandeId}`);
    }

    try {
        await restockNotification(tx, [produitId]);
    } catch (err) {
        console.error("Notification resolving failed (removeLigne)", err);
    }
}