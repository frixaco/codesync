import { FastifyInstance } from "fastify";
import prisma from "./db";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function routesPlugin(fastify: FastifyInstance) {
    fastify.route({
        method: "POST",
        url: "/refresh",
        handler: async (request, reply) => {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { refreshToken } = request.body;
                const payload = jwt.verify(
                    refreshToken,
                    process.env.JWT_REFRESH_SECRET as string,
                    {}
                ) as JwtPayload;

                const user = await prisma.user.findUnique({
                    where: {
                        email: payload.email,
                    },
                });

                const dbRefreshToken = jwt.verify(
                    user?.refreshToken || "",
                    process.env.JWT_REFRESH_SECRET as string,
                    {}
                ) as JwtPayload;

                if (!user || payload.email !== dbRefreshToken.email) {
                    return {
                        status: 401,
                        errorMessage: "Invalid refresh token",
                    };
                }

                const newAccessToken = jwt.sign(
                    { email: user.email },
                    process.env.JWT_ACCESS_SECRET as string,
                    {
                        expiresIn: "30m",
                    }
                );

                return {
                    newAccessToken,
                    refreshToken,
                };
            } catch (err) {
                return {
                    status: 500,
                    errorMessage: "Refresh token error",
                };
            }
        },
    });

    fastify.route({
        method: "POST",
        url: "/login",
        handler: async (request, reply) => {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { email, password } = request.body;

                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });

                if (!user || password !== user?.password) {
                    return {
                        status: 401,
                        errorMessage: "Invalid email or password",
                    };
                }

                const accessToken = jwt.sign(
                    { email: user.email },
                    process.env.JWT_ACCESS_SECRET as string,
                    { expiresIn: "30m" }
                );
                const refreshToken = jwt.sign(
                    { email },
                    process.env.JWT_REFRESH_SECRET as string,
                    {
                        expiresIn: "15d",
                    }
                );

                return {
                    accessToken,
                    refreshToken,
                };
            } catch (error) {
                return { status: 500, errorMessage: "Login error" };
            }
        },
    });

    fastify.route({
        method: "POST",
        url: "/signup",
        handler: async (request, reply) => {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { email, password } = request.body;

                const isUserExists = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });
                if (isUserExists) {
                    return {
                        errorMessage: "User already exists",
                    };
                }

                await prisma.user.create({
                    data: {
                        email,
                        password,
                    },
                });

                const accessToken = jwt.sign(
                    { email },
                    process.env.JWT_ACCESS_SECRET as string,
                    {
                        expiresIn: "30m",
                    }
                );
                const refreshToken = jwt.sign(
                    { email },
                    process.env.JWT_REFRESH_SECRET as string,
                    {
                        expiresIn: "15d",
                    }
                );

                return {
                    accessToken,
                    refreshToken,
                };
            } catch (error) {
                return { status: 500, message: `Signup user` };
            }
        },
    });
}
