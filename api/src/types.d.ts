import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
	interface FastifyInstance {
		githubOAuth2: OAuth2Namespace;
		verifyUser(): void;
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			GITHUB_CLIENT_ID: string;
			GITHUB_CLIENT_SECRET: string;
			GITHUB_APP_ID: string;
			DATABASE_URL: string;
			NODE_ENV: "development" | "production";
			COOKIE_SECRET: string;
			PORT?: string;
			PWD: string;
		}
	}
}

interface GithubToken {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	refresh_token_expires_in: number;
	token_type: string;
	scope: string;
}
