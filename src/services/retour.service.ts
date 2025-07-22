import { PrismaClient, Retour, Prisma } from "@prisma/client";
import { ensureExists, ensureUnique, stripNullish } from "../../utils/helpers";
import { CreateRetourDto, UpdateRetourDto } from "../dto/retour.dto";
import { RetourFilterDto } from "../dto/retour-filter.dto";
import { ConflictError } from "../../utils/errors";


const prisma = new PrismaClient()




export async function createRetour(data: CreateRetourDto): Promise<ServiceResponse<Retour>> {

    await ensureExists(
        () => prisma.commande.findUnique({ where: { idCommande: data.commandeId } }),
        "Order",
    );
    await ensureUnique(() =>
        prisma.retour.findUnique({
            where: { commandeId: data.commandeId },
        }),
        "Order",
    );


    try {
        const retour = await prisma.retour.create({
            data: {
                dateRetour: new Date(data.dateRetour),
                statutRetour: data.statutRetour,
                raisonRetour: data.raisonRetour,
                commande: { connect: { idCommande: data.commandeId } }
            },
        });
        return { statusCode: 201, data: retour };

    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {


            throw new ConflictError(`A return for order "${data.commandeId}" already exists.`);

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
            contains: filters.search
        };
    }


    try {
        const [total, retours] = await Promise.all([
            prisma.retour.count({ where }),
            prisma.retour.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { dateRetour: 'asc' },
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
                }
            }
        };
    } catch (e) {
        console.error('Error in getAllRetours:', e);
        throw e;
    }
}



export async function getRetourById(id: number): Promise<ServiceResponse<Retour>> {
    const retour = await ensureExists(() => prisma.retour.findUnique({ where: { idRetour: id } }), "Retour")
    return { statusCode: 200, data: retour }
}


export async function updateRetour(id: number, data: UpdateRetourDto): Promise<ServiceResponse<Retour>> {
    await ensureExists(() => prisma.retour.findUnique({ where: { idRetour: id } }), "Retour")
    if (data.commandeId) {
        await ensureExists(() => prisma.commande.findUnique({ where: { idCommande: data.commandeId } }), "commande")
        await ensureUnique(() => prisma.retour.findUnique({ where: { commandeId: data.commandeId } }), "Retour")
    }
    const stripData = stripNullish(data);


    const result = await prisma.retour.update({ where: { idRetour: id }, data: { ...stripData } })
    return { statusCode: 200, data: result }

}





export async function deleteRetour(id: number): Promise<ServiceResponse<null>> {
    await ensureExists(() => prisma.retour.findUnique({ where: { idRetour: id } }), "Retour")
    await prisma.retour.delete({ where: { idRetour: id } });
    return { statusCode: 204, data: null }

}

