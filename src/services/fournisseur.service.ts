import { Fournisseur } from "@prisma/client";
import {
  CreateFournisseurDto,
  UpdateFournisseurDto,
} from "../dto/fournisseur.dto";
import { ensureExists, stripNullish } from "../utils/helpers";
import { ConflictError, NotFoundError } from "../utils/errors";
import { Prisma } from "@prisma/client";
import { createHistoriqueService } from "./historique.service";
import prisma from "../prisma";
export async function createFournisseur(
  data: CreateFournisseurDto,
  utilisateurId: number
): Promise<ServiceResponse<Fournisseur>> {
  try {
    const { produitIds, ...fournisseurData } = data;

    if (produitIds && produitIds.length > 0) {
      const foundProducts = await prisma.produit.findMany({
        where: { idProduit: { in: produitIds } },
        select: { idProduit: true },
      });
      const foundIds = foundProducts.map((p) => p.idProduit);
      const missing = produitIds.filter((id) => !foundIds.includes(id));
      if (missing.length > 0) {
        throw new NotFoundError(
          "Produit",
          `Les identifiants de produit suivants n’existent pas : ${missing.join(", ")}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const fournisseur = await tx.fournisseur.create({
        data: {
          ...fournisseurData,
          produits:
            produitIds && produitIds.length > 0
              ? { connect: produitIds.map((id) => ({ idProduit: id })) }
              : undefined,
        },
      });
      await createHistoriqueService(
        tx,
        utilisateurId,
        `Création du fournisseur ${fournisseur.nom}`
      );
      return fournisseur;
    });
    return { statusCode: 201, data: result };
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const field = Array.isArray(err.meta?.target)
        ? err.meta.target[0]
        : err.meta?.target;
      throw new ConflictError("Fournisseur", field as string);
    }
    throw err;
  }
}

export async function updateFournisseur(
  id: number,
  data: UpdateFournisseurDto,
  utilisateurId: number
): Promise<ServiceResponse<Fournisseur>> {
  await ensureExists(
    () => prisma.fournisseur.findUnique({ where: { idFournisseur: id } }),
    "Fournisseur"
  );
  try {
    const stripData = stripNullish(data);
    const updated = await prisma.$transaction(async (tx) => {
      const fournisseur = await tx.fournisseur.update({
        where: { idFournisseur: id },
        data: stripData,
      });
      await createHistoriqueService(
        tx,
        utilisateurId,
        `Modification du fournisseur ${fournisseur.nom} `
      );
      return fournisseur;
    });

    return { statusCode: 200, data: updated };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const field = Array.isArray(err.meta?.target)
        ? err.meta.target[0]
        : err.meta?.target;
      throw new ConflictError("Fournisseur", field as string);
    }
    throw err;
  }
}

export async function getFournisseurById(
  id: number
): Promise<ServiceResponse<Fournisseur>> {
  const find = await prisma.fournisseur.findFirst({
    where: { idFournisseur: id },
  });
  if (!find) {
    return { statusCode: 404, error: "Not found" };
  }

  return { statusCode: 200, data: find };
}

export async function getAllFournisseur(opts?: {
  skip?: number;
  take?: number;
}): Promise<ServiceResponse<Fournisseur[]>> {
  const { skip = 0, take = 100 } = opts || {};

  const list = await prisma.fournisseur.findMany({
    skip,
    take,
    orderBy: { nom: "asc" },
  });

  return {
    statusCode: 200,
    data: list,
  };
}

export async function deleteFournisseur(
  id: number,
  utilisateurId: number
): Promise<ServiceResponse<null>> {
  await ensureExists(
    () => prisma.fournisseur.findUnique({ where: { idFournisseur: id } }),
    "Fournisseur"
  );

  await prisma.$transaction(async (tx) => {
    await tx.fournisseur.update({
      where: { idFournisseur: id },
      data: { produits: { set: [] } },
    });

    const deleted = await tx.fournisseur.delete({
      where: { idFournisseur: id },
    });

    await createHistoriqueService(
      tx,
      utilisateurId,
      `Suppression du fournisseur ${deleted.nom}`
    );
  });

  return {
    statusCode: 200,
    message: "Fournisseur supprimé avec succès.",
  };
}
