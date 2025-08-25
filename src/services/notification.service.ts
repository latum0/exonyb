import { Prisma } from "@prisma/client";
import { NotificationResponseDto } from "../dto/response.dto";
import { ensureExists } from "../utils/helpers";
import prisma from "../prisma";
import { NotificationQueryDto } from "../dto/notification.dto";
import { createHistoriqueService } from "./historique.service";



export async function createStockNotificationsIfNeeded(
    tx: Prisma.TransactionClient,
    produitIds: string[],
    ctx?: { trigger?: string; utilisateurId?: number }
): Promise<{ created: number }> {
    if (!produitIds || produitIds.length === 0) return { created: 0 };

    const uniqueIds = Array.from(new Set(produitIds));

    const produits = await tx.produit.findMany({
        where: { idProduit: { in: uniqueIds } },
        select: { idProduit: true, stock: true, nom: true }
    });

    if (produits.length === 0) return { created: 0 };

    const existing = await tx.notification.findMany({
        where: {
            produitId: { in: uniqueIds },
            type: "OUT_OF_STOCK",
            resolved: false
        },
        select: { produitId: true }
    });
    const alreadyAlerted = new Set(existing.map((e) => e.produitId));

    const toCreate = produits
        .filter((p) => p.stock === 0 && !alreadyAlerted.has(p.idProduit))
        .map((p) => {
            const trigger = ctx?.trigger ? ` (trigger: ${ctx?.trigger})` : "";
            const message = `Produit "${p.nom ?? p.idProduit}" est en rupture de stock.${trigger}`;
            return {
                produitId: p.idProduit,
                type: "OUT_OF_STOCK",
                message
            };
        });

    if (toCreate.length === 0) return { created: 0 };

    await tx.notification.createMany({
        data: toCreate,
        skipDuplicates: true
    });

    return { created: toCreate.length };
}


export async function restockNotification(
    tx: Prisma.TransactionClient,
    produitIds: string[]
): Promise<{ resolved: number }> {
    if (!produitIds || produitIds.length === 0) return { resolved: 0 };

    const uniqueIds = Array.from(new Set(produitIds));

    const active = await tx.notification.findMany({
        where: { produitId: { in: uniqueIds }, type: "OUT_OF_STOCK", resolved: false },
        select: { id: true }
    });

    if (active.length === 0) return { resolved: 0 };

    const ids = active.map((a) => a.id);
    const result = await tx.notification.updateMany({
        where: { id: { in: ids } },
        data: { resolved: true }
    });


    return { resolved: result.count };
}




export async function getNotificationById(
    id: string
): Promise<ServiceResponse<NotificationResponseDto>> {
    const notif = await ensureExists(
        () => prisma.notification.findUnique({
            where: { id },
            select: { id: true, produitId: true, type: true, message: true, createdAt: true, resolved: true }
        }),
        "Notification"
    );

    const dto: NotificationResponseDto = {
        id: notif.id,
        produitId: notif.produitId,
        type: notif.type as any,
        message: notif.message,
        createdAt: notif.createdAt,
        resolved: notif.resolved
    };

    return { statusCode: 200, data: dto };
}
export async function getNotifications() {
    const items = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            produitId: true,
            type: true,
            message: true,
            createdAt: true,
            resolved: true,
        },
    });



    return { statusCode: 200, data: items };
}


export async function deleteNotification(
    id: string,
    utilisateurId: number
): Promise<ServiceResponse<null>> {
    const notif = await ensureExists(
        () => prisma.notification.findUnique({ where: { id } }),
        "Notification"
    );

    await prisma.$transaction(async (tx) => {
        await tx.notification.delete({ where: { id } });
        await createHistoriqueService(
            tx,
            utilisateurId,
            `Suppression de la notification ID=${notif.id}`
        );
    });

    return { statusCode: 200, message: "Notification supprimée avec succès." };
}