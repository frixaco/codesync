import fastifyOauth2 from "@fastify/oauth2";
import dotenv from "dotenv";
import fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fp, { PluginMetadata } from "fastify-plugin";

import { FastifyCookieOptions } from "@fastify/cookie";
import prismaDb from "./db";
import { authRoutes, getGithubUserInfo, privateRoutes } from "./routes";

dotenv.config();

const app = fastify({
	logger: {
		transport: {
			target: "pino-pretty",
		},
	},
});
app.decorateRequest("user", {});

app.register(import("@fastify/cors"));

app.register(import("@fastify/cookie"), {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
} as FastifyCookieOptions);

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

app.register(fp(authRoutes));

app.register(
	fp(async function (fastify: FastifyInstance, opts: PluginMetadata) {
		fastify.decorate(
			"verifyUser",
			async function (
				request: FastifyRequest,
				reply: FastifyReply,
				next: (error?: object) => void,
			) {
				const { authorization } = request.headers;
				const accessToken = authorization || "";

				this.log.info(accessToken, "REQUEST AUTHORIZATION HEADER");

				const githubUser = await getGithubUserInfo(accessToken);
				if (!githubUser) {
					// Can I trigger handleUri by redirect to vscode:// while being in VSCode?
					next({
						success: false,
						statusCode: 401,
						errorMessage: "Not authorized. Not a Github user",
					});
					return;
				}

				const user = await prismaDb.user.findUnique({
					where: {
						githubId: githubUser.id,
					},
				});
				if (user) {
					request.user = user;
					next();
					return;
				}

				next({
					success: false,
					statusCode: 401,
					errorMessage: "Not authorized. User not found in database",
				});
			},
		);
	}),
);

app.register(import("@fastify/auth"));
app.after((err) => {
	app.log.error(err);
});
app.register(fp(privateRoutes));

const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
	try {
		await app.listen({ port: PORT });
		console.log(`Server is up on PORT ${PORT}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
start().finally(async () => {
	await prismaDb.$disconnect();
});

// Generate JWT access token for Github App
//
// const privateKey = fs.readFileSync(
// 	path.join(
// 		__dirname,
// 		"../../codesync-auth.2022-08-13.private-key.pem",
// 	),
// 	"utf8",
// );
// const payload = {
// 	// # issued at time, 60 seconds in the past to allow for clock drift
// 	iat: new Date().getSeconds() - 60,
// 	// # JWT expiration time (10 minute maximum)
// 	exp: new Date().getSeconds() + 10 * 60,
// 	// # GitHub App's identifier
// 	iss: process.env.GITHUB_APP_ID,
// };

// console.log("start");
// const token = jwt.sign(payload, privateKey, {
// 	algorithm: "RS256",
// 	// issuer: process.env.GITHUB_APP_ID,
// 	// expiresIn: "10m",
// });
// // console.log("token", token);
