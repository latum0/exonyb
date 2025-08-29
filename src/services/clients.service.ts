import { Client, Prisma, ClientStatut } from "@prisma/client";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConflictError } from "../utils/errors";
import { ensureExists, stripNullish } from "../utils/helpers";
import { ClientFilterDto } from "../dto/client-filter.dto";
import { createHistoriqueService } from "./historique.service";

import prisma from "../prisma";

export async function createClient(
  dto: CreateClientDto,
  utilisateurId: number
): Promise<ServiceResponse<Client>> {
  try {
    const { commentaires, ...clientData } = dto;

    const newClient = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({ data: clientData });

      if (commentaires?.length) {
        const commentaireInputs: Prisma.CommentaireCreateManyInput[] =
          commentaires.map((c) => ({
            contenu: c.contenu,
            clientId: client.idClient,
          }));
        await tx.commentaire.createMany({ data: commentaireInputs });
      }

      await createHistoriqueService(
        tx,
        utilisateurId,
        `Création du client ${dto.nom} ${dto.prenom}`
      );

      return client;
    });

    return { statusCode: 201, data: newClient };
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      const field = Array.isArray(err.meta?.target)
        ? err.meta.target[0]
        : err.meta?.target;
      throw new ConflictError("Client", field as string);
    }
    throw err;
  }
}
export async function getAllClients(filter: ClientFilterDto = {}) {
  const perPage = filter.perPage ? parseInt(filter.perPage as any) : 25;

  const baseWhere: any = {};

  if (filter.nom) baseWhere.nom = filter.nom;
  if (filter.prenom) baseWhere.prenom = filter.prenom;
  if (filter.adresse) baseWhere.adresse = filter.adresse;
  if (filter.email) baseWhere.email = filter.email;

  if (filter.phonePrefix) {
    baseWhere.numeroTelephone = { startsWith: filter.phonePrefix };
  } else if (filter.numeroTelephone) {
    baseWhere.numeroTelephone = filter.numeroTelephone;
  }

  if (filter.search) {
    baseWhere.OR = [
      { nom: { contains: filter.search } },
      { prenom: { contains: filter.search } },
      { adresse: { contains: filter.search } },
      { email: { contains: filter.search } },
      { numeroTelephone: { contains: filter.search } },
    ];
  }

  const statutCondition = filter.statut
    ? filter.statut
    : { not: ClientStatut.BLACKLISTED };

  const where = {
    ...baseWhere,
    statut: statutCondition,
  };

  const cursorNom = filter.cursorNom || null;
  const cursorId = filter.cursorId ? Number(filter.cursorId) : null;

  const keysetWhere = { ...where };
  if (cursorNom !== null && cursorId !== null) {
    keysetWhere.OR = [
      { nom: { gt: cursorNom } },
      { AND: [{ nom: { equals: cursorNom } }, { idClient: { gt: cursorId } }] },
    ];
  }

  try {
    const clients = await prisma.client.findMany({
      where: keysetWhere,
      take: perPage,
      orderBy: [{ nom: "asc" }, { idClient: "asc" }],
      include: {
        commentaires: {
          take: 5,
          orderBy: { dateCreated: "desc" },
        },
      },
    });

    let nextCursor = null;
    if (clients.length > 0) {
      const last = clients[clients.length - 1];
      nextCursor = { cursorNom: last.nom, cursorId: last.idClient };
    }

    return {
      statusCode: 200,
      data: {
        data: clients,
        meta: {
          perPage,
          nextCursor,
        },
      },
    };
  } catch (e) {
    console.error("Error in getAllClientsKeyset:", e);
    throw e;
  }
}

export async function getClientById(id: number) {
  const find = await prisma.client.findFirst({
    where: { idClient: id },
    include: {
      commentaires: {
        take: 5,
        orderBy: { dateCreated: "desc" },
      },
    },
  });
  if (!find) {
    return { statusCode: 404, error: "Not found" };
  }

  return { statusCode: 200, data: find };
}

export async function updateClient(
  id: number,
  dto: UpdateClientDto,
  utilisateurId: number
): Promise<ServiceResponse<Client>> {
  await ensureExists(
    () => prisma.client.findUnique({ where: { idClient: id } }),
    "Client"
  );

  const { commentaires, ...rest } = dto;
  const data = stripNullish(rest) as Prisma.ClientUpdateInput;

  if (data.email || data.numeroTelephone) {
    const existing = await prisma.client.findFirst({
      where: {
        idClient: { not: id },
        OR: [
          data.email ? { email: data.email } : undefined,
          data.numeroTelephone
            ? { numeroTelephone: data.numeroTelephone }
            : undefined,
        ].filter(Boolean) as Prisma.ClientWhereInput[],
      },
    });
    if (existing) {
      throw new ConflictError(
        "Client",
        data.email && existing.email === data.email
          ? "email"
          : "numeroTelephone"
      );
    }
  }

  try {
    const updatedClient = await prisma.$transaction(async (tx) => {
      const client = await tx.client.update({
        where: { idClient: id },
        data,
        include: { commentaires: true },
      });

      if (commentaires?.length) {
        const inputs: Prisma.CommentaireCreateManyInput[] = commentaires.map(
          (c) => ({
            contenu: c.contenu,
            clientId: id,
          })
        );
        await tx.commentaire.createMany({ data: inputs });
      }

      await createHistoriqueService(
        tx,
        utilisateurId,
        `Modification du client ${client.nom} ${client.prenom}`
      );

      return client;
    });

    return { statusCode: 200, data: updatedClient };
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const field = Array.isArray(err.meta?.target)
        ? err.meta.target[0]
        : err.meta?.target;
      throw new ConflictError("Client", field as string);
    }
    throw err;
  }
}

export async function deleteClient(
  id: number,
  utilisateurId: number
): Promise<ServiceResponse<null>> {
  const client = await ensureExists(
    () => prisma.client.findUnique({ where: { idClient: id } }),
    "Client"
  );

  await prisma.$transaction(async (tx) => {
    await tx.commentaire.deleteMany({ where: { clientId: id } });
    await tx.client.delete({ where: { idClient: id } });
    await createHistoriqueService(
      tx,
      utilisateurId,
      `suppression du client ${client.nom} ${client.prenom}`
    );
  });

  return {
    statusCode: 200,
    message: "Client supprimé avec succès.",
  };
}
