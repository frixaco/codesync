import { PrismaClient } from "@prisma/client";

const prismaDb = new PrismaClient();

/**
 * Exclude keys from user
 *
 * ts```
 * const user = await prisma.user.findUnique({ where: 1 })
 * const userWithoutPassword = exclude(user, 'password')
 * ```
 */
export function exclude<T, Key extends keyof T>(
    obj: T,
    ...keys: Key[]
): Omit<T, Key> {
    for (const key of keys) {
        delete obj[key];
    }
    return obj;
}

export default prismaDb;
