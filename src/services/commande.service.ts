import { Prisma } from "@prisma/client";
import { CreateCommandeDto, GetCommandesQueryDto, UpdateCommandeDto } from "../dto/commande.dto";
import { ensureExists, prixUnitaire, stripNullish } from "../utils/helpers";
import prisma from "../prisma";
import { CommandeResponseDto } from "../dto/response.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { createHistoriqueService } from "./historique.service";
import { addLigne, calcMontantT, removeLigne, updateLigneQuantity } from "./ligneCommande.service";
import { createStockNotificationsIfNeeded } from "./notification.service";

export async function createCommande(
  dto: CreateCommandeDto,
  utilisateurId: number
): Promise<ServiceResponse<CommandeResponseDto>> {
  // merge duplicate lines
  const mergedLinesMap = new Map<string, { quantite: number }>();
  for (const l of dto.lignes) {
    const existing = mergedLinesMap.get(l.produitId);
    if (existing) existing.quantite += l.quantite;
    else mergedLinesMap.set(l.produitId, { quantite: l.quantite });
  }
  const mergedLines = Array.from(mergedLinesMap.entries()).map(([produitId, v]) => ({
    produitId,
    quantite: v.quantite
  }));

  const produitIds = mergedLines.map(l => l.produitId);
  const uniqueProduitIds = Array.from(new Set(produitIds));

  const createdCommande = await prisma.$transaction(async (tx) => {
    await ensureExists(() => tx.client.findUnique({ where: { idClient: dto.clientId } }), "Client");

    const produits = await tx.produit.findMany({
      where: { idProduit: { in: uniqueProduitIds } },
      select: { idProduit: true, prix: true, remise: true, stock: true, nom: true }
    });
    const produitMap = new Map(produits.map(p => [p.idProduit, p]));

    let total = new Prisma.Decimal(0);
    const linesPrepared = mergedLines.map(l => {
      const prod = produitMap.get(l.produitId);
      if (!prod) throw new NotFoundError(`Produit not found: ${l.produitId}`);

      const prixAfterRemise = prixUnitaire(prod.remise ?? 0, prod.prix);
      if (prixAfterRemise.isNegative())
        throw new BadRequestError(`Prix négatif pour ${prod.nom}`);

      const lineTotal = prixAfterRemise.mul(l.quantite);
      total = total.plus(lineTotal);

      return {
        produitId: l.produitId,
        quantite: l.quantite,
        prixUnitaireDecimal: prixAfterRemise
      };
    });

    for (const lp of linesPrepared) {
      const r = await tx.produit.updateMany({
        where: { idProduit: lp.produitId, stock: { gte: lp.quantite } },
        data: { stock: { decrement: lp.quantite } }
      });
      if (r.count === 0) {
        const prod = produitMap.get(lp.produitId);
        throw new BadRequestError(`Stock insuffisant pour le produit ${prod?.nom ?? lp.produitId}`);
      }
    }

    const created = await tx.commande.create({
      data: {
        dateCommande: dto.dateCommande ?? new Date(),
        statut: dto.statut,
        adresseLivraison: dto.adresseLivraison,
        montantTotal: total.toString(),
        clientId: dto.clientId,
        lignesCommande: {
          create: linesPrepared.map(lp => ({
            produit: { connect: { idProduit: lp.produitId } },
            quantite: lp.quantite,
            prixUnitaire: lp.prixUnitaireDecimal.toString()
          }))
        }
      },
      include: {
        lignesCommande: true
      }
    });

    await createHistoriqueService(
      tx,
      utilisateurId,
      `Création de la commande ${created.idCommande} pour le client ${created.clientId}`
    );

    try {
      await createStockNotificationsIfNeeded(tx, uniqueProduitIds, {
        trigger: `commande:${created.idCommande}`,
        utilisateurId
      });
    } catch (err) {
      console.error("Failed to create stock notifications", err);
    }

    return created;
  });

  const responseDto: CommandeResponseDto = {
    idCommande: createdCommande.idCommande,
    dateCommande: createdCommande.dateCommande,
    statut: createdCommande.statut,
    adresseLivraison: createdCommande.adresseLivraison,
    montantTotal: (createdCommande.montantTotal as any)?.toString
      ? (createdCommande.montantTotal as any).toString()
      : String(createdCommande.montantTotal),
    clientId: createdCommande.clientId,
    ligne: (createdCommande.lignesCommande || []).map((l: any) => ({
      idLigne: l.idLigne,
      produitId: l.produitId,
      quantite: l.quantite,
      prixUnitaire: (l.prixUnitaire as any)?.toString ? (l.prixUnitaire as any).toString() : String(l.prixUnitaire),
    }))
  };

  return { statusCode: 201, data: responseDto };
}





export async function updateCommandeMontantT(
  idCommande: string,
  montantT: string | Prisma.Decimal,
  utilisateurId?: number
): Promise<ServiceResponse<CommandeResponseDto>> {

  await ensureExists(() => prisma.commande.findUnique({ where: { idCommande }, select: { idCommande: true } }), "Commande");

  if (montantT === null || montantT === undefined) {
    throw new BadRequestError("Montant total est invalide");
  }

  let dec: Prisma.Decimal;
  try {
    dec = new Prisma.Decimal(montantT).toDecimalPlaces(2);
    if (dec.isNegative()) throw new Error();
  } catch {
    throw new BadRequestError("Montant total invalide");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const prev = await tx.commande.findUnique({ where: { idCommande } });
    const u = await tx.commande.update({
      where: { idCommande },
      data: { montantTotal: dec }
    });
    if (utilisateurId) {
      await createHistoriqueService(tx, utilisateurId, `Montant total modifié pour la commande ${idCommande} (ancien: ${prev?.montantTotal?.toString() ?? 'N/A'} -> nouveau: ${dec.toFixed(2)})`);
    }
    return u;
  });

  const responseDto: CommandeResponseDto = {
    dateCommande: updated.dateCommande,
    adresseLivraison: updated.adresseLivraison,
    statut: updated.statut,
    montantTotal: updated.montantTotal.toString(),
    idCommande: updated.idCommande,
    clientId: updated.clientId
  };
  return { statusCode: 200, data: responseDto };
}



export async function updateCommande(
  idCommande: string,
  dto: UpdateCommandeDto,
  utilisateurId?: number
): Promise<ServiceResponse<CommandeResponseDto>> {

  if (dto.lignes && !Array.isArray(dto.lignes)) throw new BadRequestError('lignes must be an array');

  const strp = stripNullish(dto);
  const { lignes, ...commandePatch } = strp as any;

  const updatedCmd = await prisma.$transaction(async (tx) => {
    await ensureExists(() => tx.commande.findUnique({ where: { idCommande } }), 'Commande');


    if (Array.isArray(lignes)) {
      for (const patch of lignes) {
        if (patch.op === 'update') {
          if (!patch.produitId || patch.quantite === undefined) { throw new BadRequestError("Le produitId ou la quantité doit exister.") };
          await updateLigneQuantity(tx, patch.produitId, idCommande, patch.quantite, utilisateurId);
          if (utilisateurId) await createHistoriqueService(tx, utilisateurId, `Quantité modifiée: produit ${patch.produitId} -> ${patch.quantite} (commande ${idCommande})`);
        } else if (patch.op === 'add') {
          if (!patch.produitId || patch.quantite === undefined) throw new BadRequestError("Le produitId ou la quantité doit exister.")
          await addLigne(tx, idCommande, patch.produitId, patch.quantite, utilisateurId);
        } else if (patch.op === 'remove') {
          if (!patch.produitId) throw new BadRequestError("Le produitId ou la quantité doit exister.");
          await removeLigne(tx, idCommande, patch.produitId, utilisateurId);
        } else {
          throw new BadRequestError('Opération invalide pour la ligne.');
        }
      }
    }

    const totalDecimal = await calcMontantT(tx, idCommande);
    const totalStr = totalDecimal.toFixed(2);
    if (commandePatch.clientId) {
      await ensureExists(() => prisma.client.findUnique({ where: { idClient: commandePatch.clientId } }), "Client")
    }

    const updated = await tx.commande.update({
      where: { idCommande },
      data: { ...commandePatch, montantTotal: totalStr }, include: { lignesCommande: true }
    });


    return updated;
  });

  const responseDto: CommandeResponseDto = {
    idCommande: updatedCmd.idCommande,
    dateCommande: updatedCmd.dateCommande,
    statut: updatedCmd.statut,
    adresseLivraison: updatedCmd.adresseLivraison,
    montantTotal: updatedCmd.montantTotal.toString(),
    clientId: updatedCmd.clientId,
    ligne: (updatedCmd.lignesCommande || []).map((l: any) => ({
      idLigne: l.idLigne,
      produitId: l.produitId,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire != null ? String(l.prixUnitaire) : "0",
      commandeId: l.commandeId
    }))
  };

  return { statusCode: 200, data: responseDto };
}



export async function getCommandeById(idCommande: string): Promise<ServiceResponse<CommandeResponseDto>> {
  const commande = await ensureExists(() => prisma.commande.findUnique(
    {
      where: { idCommande },
      include: {
        lignesCommande: {
          select: {
            idLigne: true,
            produitId: true,
            quantite: true,
            prixUnitaire: true,
            commandeId: true
          }
        }
      }
    }), "Commande")



  const dto: CommandeResponseDto = {
    idCommande: commande.idCommande,
    dateCommande: commande.dateCommande,
    statut: commande.statut,
    adresseLivraison: commande.adresseLivraison,
    montantTotal: commande.montantTotal.toString(),
    clientId: commande.clientId,
    ligne: (commande.lignesCommande || []).map((l: any) => ({
      idLigne: l.idLigne,
      produitId: l.produitId,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire != null ? String(l.prixUnitaire) : "0",
      commandeId: l.commandeId
    }))

  };
  return { statusCode: 200, data: dto }

}


type PaginatedCommandes = {
  items: CommandeResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function getCommandes(
  q: GetCommandesQueryDto = {}
): Promise<ServiceResponse<PaginatedCommandes>> {
  const page = Math.max(1, Math.floor(q.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(q.limit ?? 10)));

  const where: any = {};

  if (typeof q.clientId === "number") where.clientId = q.clientId;
  if (q.statut) where.statut = q.statut;

  if (q.search) {
    where.adresseLivraison = { contains: q.search, mode: "insensitive" as const };
  }

  if (q.dateFrom || q.dateTo) {
    where.dateCommande = {};
    if (q.dateFrom) where.dateCommande.gte = new Date(q.dateFrom);
    if (q.dateTo) where.dateCommande.lte = new Date(q.dateTo);
  }

  if (typeof q.minTotal === "number" || typeof q.maxTotal === "number") {
    where.montantTotal = {};
    if (typeof q.minTotal === "number") where.montantTotal.gte = q.minTotal;
    if (typeof q.maxTotal === "number") where.montantTotal.lte = q.maxTotal;
  }

  if (q.produitId) {
    where.lignesCommande = { some: { produitId: q.produitId } };
  }

  const orderField = q.orderBy ?? "dateCommande";
  const orderDir = (q.orderDir ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const skip = (page - 1) * limit;
  const [total, rows] = await prisma.$transaction([
    prisma.commande.count({ where }),
    prisma.commande.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [orderField]: orderDir },
      include: {
        lignesCommande: {
          select: {
            idLigne: true,
            produitId: true,
            quantite: true,
            prixUnitaire: true,
            commandeId: true
          }
        }
      }
    })
  ]);

  const items: CommandeResponseDto[] = rows.map((c) => ({
    idCommande: c.idCommande,
    dateCommande: c.dateCommande,
    statut: c.statut,
    adresseLivraison: c.adresseLivraison,
    montantTotal: c.montantTotal != null ? String(c.montantTotal) : "0",
    clientId: c.clientId,
    ligne: (c.lignesCommande || []).map((l) => ({
      idLigne: l.idLigne,
      produitId: l.produitId,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire != null ? String(l.prixUnitaire) : "0",
      commandeId: l.commandeId
    }))
  }));

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const meta = {
    total,
    page,
    limit,
    totalPages
  };

  return { statusCode: 200, data: { items, meta } };
}

export async function deleteCommande(
  idCommande: string,
  utilisateurId: number
): Promise<ServiceResponse<null>> {
  await ensureExists(
    () => prisma.commande.findUnique({ where: { idCommande } }),
    "Commande"
  );

  await prisma.$transaction(async (tx) => {
    const lines = await tx.ligneCommande.findMany({
      where: { commandeId: idCommande },
      select: { quantite: true, produitId: true }
    });

    const totalsByProduit = lines.reduce<Record<string, number>>((acc, l) => {
      acc[l.produitId] = (acc[l.produitId] || 0) + l.quantite;
      return acc;
    }, {});

    await tx.commande.deleteMany({ where: { idCommande } });

    const updates: Promise<any>[] = Object.entries(totalsByProduit).map(([produitId, qty]) =>
      tx.produit.update({
        where: { idProduit: produitId },
        data: { stock: { increment: qty } }
      })
    );
    await Promise.all(updates);

    await createHistoriqueService(
      tx,
      utilisateurId,
      `suppression de la commande ID=${idCommande}`
    );
  });

  return { statusCode: 200, message: "Commande supprimée" };
}



export async function updateCommandeStatut(tx: Prisma.TransactionClient, idClient: number, statut: string): Promise<void> {
  await ensureExists(() => tx.client.findUnique({ where: { idClient } }), "Client")
  await prisma.commande.updateMany({ where: { clientId: idClient }, data: { statut } })

}