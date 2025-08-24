import { Client } from "@prisma/client";
import { ensureExists } from "../utils/helpers";
import { ClientStatut } from "@prisma/client";
import { createHistoriqueService } from "./historique.service";

import prisma from "../prisma";

export async function addToBlacklist(
  id: number,
  utilisateurId: number
): Promise<ServiceResponse<Client>> {
  const client = await ensureExists(
    () => prisma.client.findUnique({ where: { idClient: id } }),
    "Client"
  );

  if (client.statut === ClientStatut.BLACKLISTED) {
    return { statusCode: 409, message: "Client already blacklisted" };
  }
  const blacklisted = await prisma.$transaction(async (tx) => {
    const updated = await tx.client.update({
      where: { idClient: id },
      data: { statut: ClientStatut.BLACKLISTED },
    });

    await createHistoriqueService(
      tx,
      utilisateurId,
      `Ajout du client ${updated.nom} ${updated.prenom} à la liste noire`
    );

    return updated;
  });

  return {
    statusCode: 200,
    data: blacklisted,
    message: "Client ajouté à la liste noire.",
  };
}

export async function deleteFromBlacklist(
  id: number,
  utilisateurId: number
): Promise<ServiceResponse<Client>> {
  const client = await ensureExists(
    () => prisma.client.findUnique({ where: { idClient: id } }),
    "Client"
  );

  if (client.statut === ClientStatut.ACTIVE) {
    return { statusCode: 409, message: "Client already active" };
  }
  const activated = await prisma.$transaction(async (tx) => {
    const updated = await tx.client.update({
      where: { idClient: id },
      data: { statut: ClientStatut.ACTIVE },
    });

    await createHistoriqueService(
      tx,
      utilisateurId,
      `Suppression du client ${updated.nom}  ${updated.prenom} de la liste noire`
    );

    return updated;
  });

  return {
    statusCode: 200,
    data: activated,
    message: "Client retiré de la liste noire.",
  };
}

export async function getAllBlacklistedClients(opts?: {
  skip?: number;
  take?: number;
}): Promise<ServiceResponse<Client[]>> {
  const { skip = 0, take = 100 } = opts || {};
  const list = await prisma.client.findMany({
    where: { statut: ClientStatut.BLACKLISTED },
    skip,
    take,
    orderBy: { nom: "asc" },
    include: { commentaires: true },
  });
  return { statusCode: 200, data: list, message: "List of the blacklist." };
}

export async function getBlacklistedClientById(
  id: number
): Promise<ServiceResponse<Client>> {
  const blacklistedClient = await ensureExists(
    () =>
      prisma.client.findUnique({
        where: { idClient: id, statut: ClientStatut.BLACKLISTED },
        include: { commentaires: true },
      }),
    "Blacklisted client"
  );
  return { statusCode: 200, data: blacklistedClient };
}
