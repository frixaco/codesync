import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * Exclude keys from user
 *
 * ts```
 * const user = await prisma.user.findUnique({ where: 1 })
 * const userWithoutPassword = exclude(user, 'password')
 * ```
 */
export function exclude<User, Key extends keyof User>(
    user: User,
    ...keys: Key[]
): Omit<User, Key> {
    for (const key of keys) {
        delete user[key];
    }
    return user;
}

export default db;
