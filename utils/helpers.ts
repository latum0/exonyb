
import { ConflictError, NotFoundError } from "./errors";

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