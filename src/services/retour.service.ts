import { Retour, Prisma } from "@prisma/client";

import { CreateRetourDto, UpdateRetourDto } from "../dto/retour.dto";
import { RetourFilterDto } from "../dto/retour-filter.dto";

import { createHistoriqueService } from "./historique.service";

import prisma from "../prisma";
import { ConflictError } from "../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helpers";

export async function createRetour(
  data: CreateRetourDto,
  utilisateurId: number
): Promise<ServiceResponse<Retour>> {
  await ensureExists(
    () =>
      prisma.commande.findUnique({ where: { idCommande: data.commandeId } }),
    "Order"
  );
  await ensureUnique(
    () => prisma.retour.findUnique({ where: { commandeId: data.commandeId } }),
    "Retour"
  );

  try {
    const newRetour = await prisma.$transaction(async (tx) => {
      const created = await tx.retour.create({
        data: {
          dateRetour: new Date(data.dateRetour),
          statutRetour: data.statutRetour,
          raisonRetour: data.raisonRetour,
          commande: { connect: { idCommande: data.commandeId } },
        },
      });
      tx.commande.update({ where: { idCommande: data.commandeId }, data: { statut: "RETORNÉE" } })

      await createHistoriqueService(
        tx,
        utilisateurId,
        `Création du retour pour commande ID=${data.commandeId}`
      );

      return created;
    });

    return { statusCode: 201, data: newRetour };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new ConflictError(
        `Un retour existe déjà pour la commande ID=${data.commandeId}.`
      );
    }
    throw err;
  }
}

export async function getAllRetours(filters: RetourFilterDto = {}) {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 25;
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (filters.statutRetour) {
    where.statutRetour = filters.statutRetour;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dateRetour = {};
    if (filters.dateFrom) where.dateRetour.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.dateRetour.lte = new Date(filters.dateTo);
  }

  if (filters.search) {
    where.raisonRetour = {
      contains: filters.search,
    };
  }

  try {
    const [total, retours] = await Promise.all([
      prisma.retour.count({ where }),
      prisma.retour.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { dateRetour: "asc" },
      }),
    ]);

    return {
      statusCode: 200,
      data: {
        data: retours,
        meta: {
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      },
    };
  } catch (e) {
    console.error("Error in getAllRetours:", e);
    throw e;
  }
}

export async function getRetourById(
  id: number
): Promise<ServiceResponse<Retour>> {
  const retour = await ensureExists(
    () => prisma.retour.findUnique({ where: { idRetour: id } }),
    "Retour"
  );
  return { statusCode: 200, data: retour };
}

export async function updateRetour(
  id: number,
  data: UpdateRetourDto,
  utilisateurId: number
): Promise<ServiceResponse<Retour>> {
  await ensureExists(
    () => prisma.retour.findUnique({ where: { idRetour: id } }),
    "Retour"
  );

  if (data.commandeId) {
    await ensureExists(
      () =>
        prisma.commande.findUnique({ where: { idCommande: data.commandeId } }),
      "Commande"
    );
    await ensureUnique(
      () =>
        prisma.retour.findUnique({ where: { commandeId: data.commandeId } }),
      "Retour"
    );
  }

  const stripData = stripNullish(data);

  const updatedRetour = await prisma.$transaction(async (tx) => {
    await tx.retour.findUnique({ where: { idRetour: id } });

    const retour = await tx.retour.update({
      where: { idRetour: id },
      data: { ...stripData },
    });

    await createHistoriqueService(
      tx,
      utilisateurId,
      `Modification du retour ID=${id}`
    );

    return retour;
  });

  return { statusCode: 200, data: updatedRetour };
}

export async function deleteRetour(
  idRetour: number,
  utilisateurId: number
): Promise<ServiceResponse<null>> {
  const retour = await ensureExists(
    () => prisma.retour.findUnique({ where: { idRetour } }),
    "Retour"
  );

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.retour.delete({ where: { idRetour } });
    await tx.commande.update({ where: { idCommande: retour.commandeId }, data: { statut: "EN ATTENTE" } })
    await createHistoriqueService(
      tx,
      utilisateurId,
      `Suppression du retour ID=${deleted.idRetour}`
    );
  });
  return { statusCode: 200, message: "Retour supprimé avec succès." };
}
