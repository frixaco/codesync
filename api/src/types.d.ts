import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
	interface FastifyInstance {
		githubOAuth2: OAuth2Namespace;
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			GITHUB_CLIENT_ID: string;
			GITHUB_CLIENT_SECRET: string;
			DATABASE_URL: string;
			NODE_ENV: "development" | "production";
			PORT?: string;
			PWD: string;
		}
	}
}
