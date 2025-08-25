
import { Prisma } from "@prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "./errors";

//used to check the existing of a value, otherwise return an error
export async function ensureExists<T>(find: () => Promise<T | null>, entity: string): Promise<T> {
    const check = await find();
    if (check === null) {
        throw new NotFoundError(`${entity}`);
    }
    return check;
}


//deleting null fields
export function stripNullish<T extends object>(dto: T): Partial<T> {

    return Object.fromEntries(
        Object.entries(dto).filter(([_, v]) => v != null)
    ) as Partial<T>;
}



export async function ensureUnique<T>(find: () => Promise<T | null>, entity: string): Promise<void> {
    const check = await find();
    if (check) {
        throw new ConflictError(`${entity} found`)
    }
}


export function parseRemiseToFraction(remise: number | null | undefined) {
    if (!remise || remise <= 0) return 0;
    if (remise <= 1) return remise;
    return remise / 100;
}

type Update =
    | { prixUnitaire: number; quantite?: number }
    | { prixUnitaire?: number; quantite: number };

export function newMontantTotal(
    oldQuantity: number,
    oldPrixUnitaire: number,
    oldMontantTotal: number,
    update: Update
): number {
    const newQuantity = update.quantite ?? oldQuantity;
    const newPrixUnit = update.prixUnitaire ?? oldPrixUnitaire;

    const produitTotal = newQuantity * newPrixUnit;
    const oldProduitTotal = oldQuantity * oldPrixUnitaire;

    const constantPart = oldMontantTotal - oldProduitTotal;

    return constantPart + produitTotal;
}


export function prixUnitaire(remise: number | undefined, prix: number | string | Prisma.Decimal): Prisma.Decimal {
    const remiseFraction = parseRemiseToFraction(remise ?? 0);

    if (remiseFraction < 0 || remiseFraction > 1) {
        throw new BadRequestError("Remise invalide");
    }

    const prixOrig =
        typeof prix === "number"
            ? new Prisma.Decimal(Number(prix).toFixed(2))
            : prix instanceof Prisma.Decimal
                ? prix
                : new Prisma.Decimal(prix as any);

    const prixAfterRemise = prixOrig.mul(new Prisma.Decimal(1).minus(new Prisma.Decimal(remiseFraction)));

    if (prixAfterRemise.isNegative()) {
        throw new BadRequestError("Prix négatif après remise");
    }

    return new Prisma.Decimal(prixAfterRemise.toFixed(2));
}

