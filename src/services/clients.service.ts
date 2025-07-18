
import { Client, PrismaClient, Prisma } from "@prisma/client";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConflictError } from "../../utils/errors";
import { ensureExists, ensureUnique, stripNullish } from "../../utils/helpers";


const prisma = new PrismaClient();


export async function createClient(
  dto: CreateClientDto
): Promise<ServiceResponse<Client>> {
  try {

    const { commentaires, ...clientData } = dto;
    const client = await prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: clientData
      });

      if (commentaires?.length) {
        const commentaireInputs: Prisma.CommentaireCreateManyInput[] = commentaires.map(
          (c) => ({
            contenu: c.contenu,
            clientId: newClient.idClient,
          })
        );

        await tx.commentaire.createMany({ data: commentaireInputs });
      }

      return newClient;
    });

    return { statusCode: 201, data: client };
  } catch (err) {
    if (
      err instanceof PrismaClientKnownRequestError &&
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



export async function getAllClients(opts?: {
  skip?: number;
  take?: number;
}): Promise<ServiceResponse<Client[]>> {
  const { skip = 0, take = 100 } = opts || {};

  const list = await prisma.client.findMany({
    skip,
    take,
    orderBy: { nom: "asc" },
  });

  return {
    statusCode: 200,
    data: list,
  };
}


export async function getClientById(
  id: number
): Promise<ServiceResponse<Client>> {
  const find = await prisma.client.findFirst({ where: { idClient: id } })
  if (!find) {
    return { statusCode: 404, error: "Not found" }
  }

  return { statusCode: 200, data: find }
}




export async function updateClient(
  id: number,
  dto: UpdateClientDto
): Promise<ServiceResponse<Client>> {

  await ensureExists(
    () => prisma.client.findUnique({ where: { idClient: id } }),
    "Client"
  );
  const { commentaires, ...rest } = dto;
  const data = stripNullish(rest) as Prisma.ClientUpdateInput;

  if (data.email || data.numeroTelephone) {
    await ensureUnique(
      () => prisma.client.findFirst({
        where: {
          idClient: { not: id },
          OR: [
            data.email ? { email: data.email } : undefined,
            data.numeroTelephone ? { numeroTelephone: data.numeroTelephone } : undefined,
          ].filter(Boolean) as Prisma.ClientWhereInput[],
        },
      }),
      "Client with this email or phone number"
    );
  }

  const updatedClient = await prisma.$transaction(async (tx) => {
    const client = await tx.client.update({
      where: { idClient: id },
      data,
      include: { commentaires: true },
    });

    if (commentaires?.length) {
      const inputs: Prisma.CommentaireCreateManyInput[] = commentaires.map(
        (c) => ({ contenu: c.contenu, clientId: id })
      );
      await tx.commentaire.createMany({ data: inputs });
    }

    return client;
  });

  return { statusCode: 200, data: updatedClient };
}





export async function deleteClient(id: number): Promise<ServiceResponse<null>> {

  await ensureExists(
    () => prisma.client.findUnique({ where: { idClient: id } }),
    "Client"
  );


  await prisma.$transaction(async (tx) => {
    await tx.commentaire.deleteMany({ where: { clientId: id } });
    await tx.client.delete({ where: { idClient: id } });
  });

  return {
    statusCode: 200,
    message: "Client deleted successfully.",
  };
}

