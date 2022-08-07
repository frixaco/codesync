import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import fastifyOauth2 from "@fastify/oauth2";

import prismaDb from "./db";

const app = fastify({
	logger: {
		transport: {
			target: "pino-pretty",
		},
	},
});

app.register(import("@fastify/cors"));
app.register(fastifyOauth2, {
	name: "githubOAuth2",
	credentials: {
		client: {
			id: process.env.GITHUB_CLIENT_ID,
			secret: process.env.GITHUB_CLIENT_SECRET,
		},
		auth: fastifyOauth2.GITHUB_CONFIGURATION,
	},
	startRedirectPath: "/login/oauth/github",
	callbackUri: "http://localhost:4000/login/oauth/github/callback",
	scope: [],
});
app.register(import("./routes"));

const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
	try {
		app.listen({ port: PORT });
		app.log.info(`Server is up on PORT ${PORT}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
start().finally(async () => {
	await prismaDb.$disconnect();
});
