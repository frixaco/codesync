import { FastifyInstance, FastifyPluginOptions } from "fastify";
import got from "got";
import prismaDb from "./db";
import { GithubToken, GithubUser } from "./types";

export async function getGithubUserInfo(
	accessToken: string,
): Promise<GithubUser | null> {
	const githubUser = await got
		.get("https://api.github.com/user", {
			headers: {
				Authorization: `token ${accessToken}`,
			},
		})
		.json<GithubUser>();

	return "login" in githubUser ? githubUser : null;
}

export async function refreshAccessToken(
	refreshToken: string,
): Promise<GithubToken | null> {
	try {
		const newToken = await got
			.post("https://github.com/login/oauth/access_token", {
				searchParams: new URLSearchParams({
					refresh_token: refreshToken,
					grant_type: "refresh_token",
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
				}),
			})
			.json<GithubToken>();
		return "access_token" in newToken ? newToken : null;
	} catch (error) {
		return null;
	}
}

export async function authRoutes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions,
) {
	/**
	 * Redirect user to authorize using GitHub
	 */
	fastify.get(
		"/login/oauth/github/authorize",
		async function (request, reply) {
			const authorizationEndpoint =
				fastify.githubOAuth2.generateAuthorizationUri(request);
			reply.redirect(authorizationEndpoint);
		},
	);

	/**
	 * Refresh user auth token.
	 * Send refreshToken in Authorization header.
	 * Get new accessToken in Authorization header and refreshToken in response body.
	 */
	fastify.get("/login/oauth/github/refresh", async function (request, reply) {
		try {
			const { authorization } = request.headers;
			const refreshToken = authorization || "";

			const newToken = await refreshAccessToken(refreshToken);
			if (!newToken) {
				reply.send({
					success: false,
					statusCode: 401,
					errorMessage: "Invalid refresh token.",
				});
				return;
			}

			const githubUser = await getGithubUserInfo(newToken.access_token);
			if (!githubUser) {
				reply.send({
					success: false,
					statusCode: 401,
					errorMessage: "Not a Github user.",
				});
			}

			await prismaDb.user.update({
				where: {
					githubId: githubUser?.id,
				},
				data: {
					refreshToken: newToken.refresh_token,
				},
			});

			reply.header("authorization", newToken.access_token);
			reply.send({
				success: true,
				accessToken: newToken.access_token,
				refreshToken: newToken.refresh_token,
			});
		} catch (error) {
			reply.send({
				success: false,
				statusCode: 401,
				errorMessage:
					"Couldn't check access token. Make sure Authorization header is set to valid refresh token.",
			});
		}
	});

	/**
	 * Finish GitHub OAuth process
	 */
	fastify.get<{
		Querystring: {
			code: string;
			state: string;
		};
	}>("/login/oauth/github/callback", async function (request, reply) {
		try {
			if (new URLSearchParams(request.url).get("error_description")) {
				reply.redirect("vscode://frixaco.codesync-extension/callback");
				return;
			}

			const authData =
				await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(
					request,
				);
			if ("error" in authData.token) {
				reply.redirect("vscode://frixaco.codesync-extension/callback");
				return;
			}

			const githubUser = await getGithubUserInfo(
				authData.token.access_token,
			);
			if (!githubUser) {
				reply.redirect("vscode://frixaco.codesync-extension/callback");
				return;
			}

			const existingUser = await prismaDb.user.findUnique({
				where: {
					githubId: githubUser.id,
				},
			});
			if (!existingUser) {
				await prismaDb.user.create({
					data: {
						githubId: githubUser.id,
						refreshToken: authData.token.refresh_token || "",
					},
				});
			} else {
				await prismaDb.user.update({
					where: {
						id: existingUser.id,
					},
					data: {
						refreshToken: authData.token.refresh_token || "",
					},
				});
			}

			reply.redirect(
				`vscode://frixaco.codesync-extension/callback?access_token=${authData.token.access_token}&refresh_token=${authData.token.refresh_token}`,
			);
		} catch (error) {
			reply.send({
				success: false,
				statusCode: 500,
				errorMessage: "Failed to handle Github OAuth callback redirect",
			});
		}
	});
}

export async function privateRoutes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions,
) {
	/**
	 * Create/Update project
	 */
	fastify.post<{
		Body: { projectName: string };
	}>(
		"/project",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			try {
				const { projectName } = request.body;

				let project = await prismaDb.project.findUnique({
					where: {
						name: projectName,
					},
				});
				if (project) {
					project = await prismaDb.project.update({
						where: {
							id: project.id,
						},
						data: {
							name: projectName,
						},
					});
				} else {
					project = await prismaDb.project.create({
						data: {
							name: projectName,
							owner: {
								connect: {
									id: request.user.id,
								},
							},
						},
					});
				}

				reply.send({ success: true, projectName: project.name });
			} catch (error) {
				reply.send({
					success: false,
					statusCode: 500,
					errorMessage: "Couldn't update or create project.",
				});
			}
		},
	);

	/**
	 * Get user projects
	 */
	fastify.get<{ Querystring: { accessToken: string } }>(
		"/project",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			try {
				const user = await prismaDb.user.findUnique({
					where: {
						id: request.user.id,
					},
					include: {
						projects: true,
					},
				});

				reply.send({ success: true, projects: user?.projects || [] });
			} catch (error) {
				reply.send({
					success: false,
					statusCode: 500,
					errorMessage: "Couldn't fetch user projects",
				});
			}
		},
	);

	/**
	 * Save project diff
	 */
	fastify.post<{
		Body: { diff: string; projectId: number };
	}>(
		"/change",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			try {
				const { diff, projectId } = request.body;

				const project = await prismaDb.project.findUnique({
					where: {
						id: projectId,
					},
					include: {
						change: true,
					},
				});
				if (!project) {
					return {
						success: false,
						statusCode: 500,
						errorMessage: "Project not found",
					};
				}

				await prismaDb.change.deleteMany({
					where: {
						id: project.change?.id,
					},
				});

				const newChange = await prismaDb.change.create({
					data: {
						diff,
						author: {
							connect: {
								id: request.user.id,
							},
						},
						project: {
							connect: {
								id: project.id,
							},
						},
					},
				});

				return {
					success: true,
					changeId: newChange.id,
					projectId,
				};
			} catch (error) {
				return {
					success: false,
					statusCode: 500,
					errorMessage: "Couldn't save project diff",
				};
			}
		},
	);

	/**
	 * Get project diff
	 */
	fastify.get<{ Querystring: { projectId: string } }>(
		"/change",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			try {
				const { projectId } = request.query;

				const change = await prismaDb.change.findUnique({
					where: {
						projectId: +projectId,
					},
				});

				if (!change) {
					reply.send({
						success: false,
						statusCode: 500,
						errorMessage: "Project changes not found",
					});
					return;
				}

				reply.send({
					success: true,
					diff: change.diff,
					changeId: change.id,
				});
			} catch (error) {
				reply.send({
					success: false,
					statusCode: 500,
					errorMessage: "Failed to fetch project diff",
				});
			}
		},
	);
}
