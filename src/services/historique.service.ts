import { Prisma } from "@prisma/client";
import { ensureExists } from "../utils/helpers";
import prisma from "../prisma";

export async function createHistoriqueService(
  tx: Prisma.TransactionClient,
  utilisateurId: number,
  descriptionAction: string
): Promise<void> {
  const user = await ensureExists(
    () => tx.users.findUnique({ where: { id: utilisateurId } }),
    "User"
  );

  const dateModification = new Date();

  await tx.historique.create({
    data: {
      dateModification,
      descriptionAction,
      utilisateurId,
      acteur: user.name,
    },
  });
}

export async function getHistoriqueById(id: number) {
  const historique = await ensureExists(
    () =>
      prisma.historique.findUnique({
        where: { idHistorique: id },
        include: {
          utilisateur: {
            select: {
              name: true,
            },
          },
        },
      }),
    "Historique"
  );
  return { statusCode: 200, data: historique };
}

export async function getAllHistoriques(filters: any = {}) {
  const page = filters.page ? parseInt(filters.page as any) : 1;
  const perPage = filters.perPage ? parseInt(filters.perPage as any) : 25;
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (filters.acteur) {
    where.utilisateur = {
      name: {
        contains: filters.acteur,
      },
    };
  }

  if (filters.descriptionAction) {
    where.descriptionAction = { contains: filters.descriptionAction };
  }

  if (filters.utilisateurId) {
    where.utilisateurId = Number(filters.utilisateurId);
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dateModification = {};
    if (filters.dateFrom)
      where.dateModification.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.dateModification.lte = new Date(filters.dateTo);
  }

  try {
    const [total, historiques] = await Promise.all([
      prisma.historique.count({ where }),
      prisma.historique.findMany({
        where,
        skip,
        take: perPage,
        select: {
          idHistorique: true,
          dateModification: true,
          descriptionAction: true,
          utilisateur: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dateModification: "desc" },
      }),
    ]);

    return {
      statusCode: 200,
      data: {
        data: historiques,
        meta: {
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      },
    };
  } catch (e) {
    console.error("Error in getAllHistoriques:", e);
    throw e;
  }
}

type DeleteOldResult = { count: number };
export async function deleteOldHistoriques(): Promise<DeleteOldResult> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const result = await prisma.historique.deleteMany({
    where: {
      dateModification: {
        lt: oneWeekAgo,
      },
    },
  });
  return { count: result.count };
}

export async function deleteHistoriqueById(
  id: number,
  utilisateurId: number
): Promise<ServiceResponse<null>> {
  await ensureExists(
    () => prisma.historique.findUnique({ where: { idHistorique: id } }),
    "Historique"
  );

  await prisma.$transaction(async (tx) => {
    await createHistoriqueService(
      tx,
      utilisateurId,
      `Historique ${id} supprimé`
    );
    await tx.historique.delete({
      where: { idHistorique: id },
    });
  });

  return {
    statusCode: 200,
    message: "Historique supprimé avec succès.",
  };
}
