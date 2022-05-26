import jwt, { JwtPayload } from "jsonwebtoken";
import { Token } from "../types";

export const issueAccessToken = (payload: { [key: string]: string | number }) =>
    issueToken(payload, process.env.JWT_ACCESS_TOKEN as string, 10 * 60 * 1000); // 10 mins
export const issueRefreshToken = (payload: {
    [key: string]: string | number;
}) =>
    issueToken(
        payload,
        process.env.JWT_ACCESS_TOKEN as string,
        14 * 24 * 60 * 60 * 1000
    ); // 14 days
export const verifyAccessToken = (token: string) =>
    verifyToken(token, process.env.JWT_ACCESS_TOKEN as string);
export const verifyRefreshToken = (token: string) =>
    verifyToken(token, process.env.JWT_ACCESS_TOKEN as string);

export async function issueToken(
    payload: { [key: string]: string | number },
    secret: string,
    expiresIn: number
): Promise<Token> {
    try {
        const token = await jwt.sign(payload, secret, { expiresIn });
        const expirationDateValue = addSeconds(
            new Date(),
            expiresIn / 1000
        ).valueOf();

        const fullToken = { token, expiresIn, expirationDateValue };
        return Promise.resolve(fullToken);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function verifyToken(
    token: string,
    secret: string
): Promise<JwtPayload | string> {
    try {
        const parsedToken = await jwt.verify(token, secret, {});
        return Promise.resolve(parsedToken);
    } catch (error) {
        return Promise.reject(error);
    }
}

export function addSeconds(date: Date, seconds = 0) {
    const newDate = new Date(date.valueOf());
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
}

export function addDays(date: Date, days = 0) {
    const newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}
