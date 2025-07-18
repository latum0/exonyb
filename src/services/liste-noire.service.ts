import { Prisma, PrismaClient, Client } from "@prisma/client";
import { ensureExists } from "../../utils/helpers";
import { ClientStatut } from "@prisma/client";



const prisma = new PrismaClient();

export async function addToBlacklist(id: number): Promise<ServiceResponse<Client>> {
    await ensureExists(() => prisma.client.findUnique({ where: { idClient: id } }), "Client")

    const blacklisted = await prisma.client.update({ where: { idClient: id }, data: { statut: ClientStatut.BLACKLISTED } })
    return { statusCode: 201, data: blacklisted, message: "Le client a été ajouté à la liste noire." }

}

export async function deleteFromBlacklist(id: number): Promise<ServiceResponse<Client>> {
    await ensureExists(() => prisma.client.findUnique({ where: { idClient: id } }), "Client")

    const unblacklist = await prisma.client.update({ where: { idClient: id }, data: { statut: ClientStatut.ACTIVE } })
    return { statusCode: 200, data: unblacklist, message: "Le client a été retiré de la liste noire." }

}

export async function getAllBlacklistedClients(opts?: { skip?: number; take?: number }): Promise<ServiceResponse<Client[]>> {
    const { skip = 0, take = 100 } = opts || {};
    const list = await prisma.client.findMany({
        where: { statut: ClientStatut.BLACKLISTED },
        skip,
        take,
        orderBy: { nom: "asc" },
    });
    return { statusCode: 200, data: list, message: "Liste des clients en liste noire" };
}


export async function getBlacklistedClientById(id: number): Promise<ServiceResponse<Client>> {
    const blacklistedClient = await ensureExists(() => prisma.client.findUnique({ where: { idClient: id } }), "Client")
    return { statusCode: 200, data: blacklistedClient }

}