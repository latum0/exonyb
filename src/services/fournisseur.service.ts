import { Fournisseur, PrismaClient } from "@prisma/client";
import { CreateFournisseurDto, UpdateFournisseurDto } from "../dto/fournisseur.dto";
import { ensureExists, stripNullish } from "../../utils/helpers";
import { ConflictError } from "../../utils/errors";
import { Prisma } from "@prisma/client";


const prisma = new PrismaClient()

export async function createFournisseur(
    data: CreateFournisseurDto
): Promise<ServiceResponse<Fournisseur>> {
    try {
        const result = await prisma.fournisseur.create({ data: { ...data } });
        return { statusCode: 201, data: result };
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
            throw new ConflictError("Fournisseur", field as string);
        }
        throw err;
    }
}




export async function updateFournisseur(id: number, data: UpdateFournisseurDto): Promise<ServiceResponse<Fournisseur>> {
    await ensureExists(() => prisma.fournisseur.findUnique({ where: { idFournisseur: id } }), "Fournisseur");

    const stripData = stripNullish(data);
    const updated = await prisma.fournisseur.update({ where: { idFournisseur: id }, data: stripData });
    return { statusCode: 200, data: updated };
}





export async function getFournisseurById(
    id: number
): Promise<ServiceResponse<Fournisseur>> {
    const find = await prisma.fournisseur.findFirst({ where: { idFournisseur: id } })
    if (!find) {
        return { statusCode: 404, error: "Not found" }
    }

    return { statusCode: 200, data: find }
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


export async function deleteFournisseur(id: number): Promise<ServiceResponse<Fournisseur>> {
    await ensureExists(() => prisma.fournisseur.findUnique({ where: { idFournisseur: id } }), "Fournisseur");
    const deleted = await prisma.fournisseur.delete({
        where: { idFournisseur: id },
    });
    return {
        statusCode: 200,
        data: deleted,
    };
}






