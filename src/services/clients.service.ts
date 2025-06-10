// src/services/clients.service.ts
import { PrismaClient } from "@prisma/client";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";


const prisma = new PrismaClient();

export async function createClient(data: CreateClientDto) {
  const conflict = await prisma.client.findFirst({
    where: {
      OR: [
        { email: data.email },
        { numeroTelephone: data.numeroTelephone },
      ],
    },
  });
  if (conflict) {
    return {
      statusCode: 409,
      message: "Email or phone already in use.",
    };
  }

  const payload: any = {
    nom: data.nom,
    prenom: data.prenom,
    adresse: data.adresse,
    email: data.email,
    numeroTelephone: data.numeroTelephone,
    statut: data.statut,
  };

  if (data.commentaires && data.commentaires.length) {
    payload.commentaires = {
      create: data.commentaires.map((c) => ({ contenu: c.contenu })),
    };
  }

  const client = await prisma.client.create({ data: payload });
  return { statusCode: 201, client };
}

export async function getAllClients() {
  const clients = await prisma.client.findMany({
    include: { commentaires: true },
  });
  return { statusCode: 200, clients };
}

export async function getClientById(id: number) {
  const client = await prisma.client.findUnique({
    where: { idClient: id },
    include: { commentaires: true },
  });
  if (!client) {
    return { statusCode: 404, message: "Client not found." };
  }
  return { statusCode: 200, client };
}

export async function updateClient(
  id: number,
  data: UpdateClientDto
) {
  const existing = await prisma.client.findUnique({
    where: { idClient: id },
  });
  if (!existing) {
    return { statusCode: 404, message: "Client not found." };
  }

  // avoid contact collisions
  if (data.email || data.numeroTelephone) {
    const conflict = await prisma.client.findFirst({
      where: {
        idClient: { not: id },
        OR: [
          data.email ? { email: data.email } : {},
          data.numeroTelephone ? { numeroTelephone: data.numeroTelephone } : {},
        ],
      },
    });
    if (conflict) {
      return {
        statusCode: 409,
        message: "Email or phone belongs to another client.",
      };
    }
  }

  const payload: any = {};
  if (data.nom) payload.nom = data.nom;
  if (data.prenom) payload.prenom = data.prenom;
  if (data.adresse) payload.adresse = data.adresse;
  if (data.email) payload.email = data.email;
  if (data.numeroTelephone) payload.numeroTelephone = data.numeroTelephone;
  if (data.statut) payload.statut = data.statut;

  if (data.commentaires && data.commentaires.length) {
    payload.commentaires = {
      create: data.commentaires.map((c) => ({ contenu: c.contenu })),
    };
  }

  const client = await prisma.client.update({
    where: { idClient: id },
    data: payload,
    include: { commentaires: true },
  });
  return { statusCode: 200, client };
}

export async function deleteClient(id: number) {
  const existing = await prisma.client.findUnique({
    where: { idClient: id },
  });
  if (!existing) {
    return { statusCode: 404, message: "Client not found." };
  }
  await prisma.commentaire.deleteMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { idClient: id } });
  return { statusCode: 200, message: "Client deleted successfully." };
}
