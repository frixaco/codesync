import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";

import prismaDb from "./db";

const app = fastify({ logger: true });
app.register(import("@fastify/cors"));
app.register(import("./routes"));

const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
    try {
        app.listen({ port: PORT });
        app.log.info(`Server is up on ${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start().finally(async () => {
    await prismaDb.$disconnect();
});
