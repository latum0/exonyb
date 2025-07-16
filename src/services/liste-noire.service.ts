import { Prisma, PrismaClient, Client } from "@prisma/client";
import { ensureExists } from "../../utils/helpers";
import { ClientStatut } from "@prisma/client";
import { CreateClientDto } from "../dto/client.dto";


const prisma = new PrismaClient();

export async function addToBlacklist(id: number): Promise<ServiceResponse<Client>> {
    await ensureExists(() => prisma.client.findUnique({ where: { idClient: id } }), "Client")

    const blacklisted = await prisma.client.update({ where: { idClient: id }, data: { statut: ClientStatut.BLACKLISTED } })
    return { statusCode: 201, data: blacklisted, message: "Le client a été ajouté à la liste noire." }

}

export async function deleteFromBlacklist(id: number): Promise<ServiceResponse<Client>> {
    await ensureExists(() => prisma.client.findUnique({ where: { idClient: id } }), "Client")

    const unblacklist = await prisma.client.update({ where: { idClient: id }, data: { statut: ClientStatut.ACTIVE } })
    return { statusCode: 200, data: unblacklist, message: "Le client a été ajouté à la liste noire." }

}

export async function getAllBlacklistedClients(opts?: { skip?: number, take?: number }): Promise<ServiceResponse<Client[]>> {
    const { skip = 0, take = 100 } = opts || {};
    const list = await prisma.client.findMany({
        skip,
        take,
        orderBy: { nom: "asc" },
    });
    return { statusCode: 200, data: list }
}


export async function getBlacklistedClientById(id: number): Promise<ServiceResponse<Client>> {
    const blacklistedClient = await ensureExists(() => prisma.client.findUnique({ where: { idClient: id } }), "Client")
    return { statusCode: 200, data: blacklistedClient }

}