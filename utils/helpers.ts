
import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "./errors";


export async function ensureExists<T>(find: () => Promise<T | null>, entity: string): Promise<T> {
    const check = await find();
    if (check === null) {
        throw new NotFoundError(`${entity}`);
    }
    return check;
}



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