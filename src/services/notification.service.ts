import { Prisma } from "@prisma/client";
import { NotificationListResponseDto, NotificationResponseDto } from "../dto/response.dto";
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

export async function getNotifications(
    query: NotificationQueryDto
): Promise<ServiceResponse<NotificationListResponseDto>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 25;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.produitId) where.produitId = query.produitId;

    if (query.resolved !== undefined && query.resolved !== null && query.resolved !== "") {
        const val = query.resolved;
        let resolvedBool: boolean | undefined;
        if (typeof val === "boolean") resolvedBool = val;
        else if (typeof val === "string") {
            const v = val.toLowerCase();
            resolvedBool = v === "true" || v === "1";
        }
        if (resolvedBool !== undefined) where.resolved = resolvedBool;
    }

    if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) where.createdAt.gte = query.dateFrom;
        if (query.dateTo) where.createdAt.lte = query.dateTo;
    }

    const orderByField = query.orderBy ?? "createdAt";
    const orderDir = query.orderDir ?? "desc";

    const [total, items] = await prisma.$transaction([
        prisma.notification.count({ where }),
        prisma.notification.findMany({
            where,
            orderBy: { [orderByField]: orderDir },
            skip,
            take: limit,
            select: { id: true, produitId: true, type: true, message: true, createdAt: true, resolved: true }
        })
    ]);

    const mapped = items.map((i) => ({
        id: i.id,
        produitId: i.produitId,
        type: i.type as any,
        message: i.message,
        createdAt: i.createdAt,
        resolved: i.resolved
    })) as NotificationResponseDto[];

    const meta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };

    const listDto: NotificationListResponseDto = {
        items: mapped,
        meta
    };

    return { statusCode: 200, data: listDto };
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