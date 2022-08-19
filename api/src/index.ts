import dotenv from "dotenv";
import fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fp, { PluginMetadata } from "fastify-plugin";
import fastifyOauth2 from "@fastify/oauth2";

import prismaDb from "./db";
import { authRoutes, privateRoutes } from "./routes";
import { FastifyCookieOptions } from "@fastify/cookie";
import got from "got";

dotenv.config();

const app = fastify({
	logger: {
		transport: {
			target: "pino-pretty",
		},
	},
});

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
				request: FastifyRequest<{
					Querystring: {
						ownerId: string;
						accessToken: string; // JSON stringified Token object
					};
				}>,
				reply: FastifyReply,
				next: (error?: object) => void,
			) {
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

				const { ownerId, accessToken } = request.query;

				try {
					await got
						.post(
							`https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`,
							{
								headers: {
									Accept: "application/vnd.github+json",
									Authorization: `Basic ${Buffer.from(
										process.env.GITHUB_CLIENT_ID +
											":" +
											process.env.GITHUB_CLIENT_SECRET,
									).toString("base64")}`,
								},
								body: JSON.stringify({
									access_token:
										JSON.parse(accessToken).access_token,
								}),
							},
						)
						.json();
				} catch (err) {
					const user = await prismaDb.user.findUnique({
						where: {
							id: +ownerId,
						},
					});

					if (!user) {
						next({
							success: false,
							statusCode: 401,
							errorMessage: "Not authorized. User not found",
						});
					}

					const newAccessToken =
						await fastify.githubOAuth2.getNewAccessTokenUsingRefreshToken(
							{
								refresh_token: user?.refreshToken,
								access_token: "blahblah",
								expires_at: new Date(
									"2022-08-19T16:29:32.958Z",
								),
								expires_in: 30000,
								token_type: "bearer",
							},
							{},
						);

					console.log("NEW TOKEN DATA", newAccessToken);

					if (
						newAccessToken.token.access_token &&
						newAccessToken.token.access_token.length > 0
					) {
						console.log("OLD refreshToken", user?.refreshToken);
						console.log(
							"NEW refreshToken",
							newAccessToken.token.refresh_token,
						);
						await prismaDb.user.update({
							where: {
								id: +ownerId,
							},
							data: {
								refreshToken:
									newAccessToken.token.refresh_token,
							},
						});
						reply.setCookie(
							"gh-auth",
							newAccessToken.token.access_token,
							{
								httpOnly: true,
								secure: true,
							},
						);
						console.log(
							"OLD ACCESS TOKEN",
							JSON.parse(accessToken).access_token,
						);
						console.log(
							"NEW ACCESS TOKEN",
							newAccessToken.token.access_token,
						);
						next();
					} else {
						next({
							success: false,
							statusCode: 401,
							errorMessage: `No access token`,
						});
					}
				}
				next();
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
