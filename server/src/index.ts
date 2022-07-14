import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";

import prismaDb from "./db";

const app = fastify({ logger: true });
app.register(import("@fastify/cors"));
app.register(import("./routes"));

const PORT = Number(process.env.PORT) || 3001;

const start = async () => {
    try {
        app.listen({ port: PORT });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start().finally(async () => {
    await prismaDb.$disconnect();
});
