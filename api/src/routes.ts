import { FastifyInstance, FastifyPluginOptions } from "fastify";
import got from "got";
import prismaDb from "./db";

export async function authRoutes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions,
) {
	/**
	 * Redirect user to authorize using GitHub OAuth
	 */
	fastify.get(
		"/login/oauth/github/authorize",
		{},
		async function (request, reply) {
			const authorizationEndpoint =
				fastify.githubOAuth2.generateAuthorizationUri(request);
			reply.redirect(authorizationEndpoint);
		},
	);

	/**
	 * Finish GitHub OAuth process
	 */
	fastify.get(
		"/login/oauth/github/callback",
		{},
		async function (request, reply) {
			const authData =
				await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(
					request,
				);

			if ("error" in authData.token) {
				reply
					.type("text/html")
					.send("<p>FAILURE. Please try again.</p>");
			}

			const githubUser: {
				id: number;
				login: string;
			} = await got
				.get("https://api.github.com/user", {
					headers: {
						Authorization: `token ${authData.token.access_token}`,
					},
				})
				.json();

			const newUser = await prismaDb.user.create({
				data: {
					githubId: githubUser.id,
					refreshToken: authData.token.refresh_token || "",
				},
			});
			console.log(`
				USER CREATED
				id: ${newUser.id}
				githubId: ${newUser.githubId}
				accessToken: ${authData.token.access_token}
				refreshToken: ${newUser.refreshToken}
			`);

			reply.setCookie("gh-auth", authData.token.access_token, {
				httpOnly: true,
				secure: true,
			});
			console.log("COOKIE SET", authData.token.access_token);

			reply
				.type("text/html")
				.send(
					`<p>SUCCESS. User ${githubUser.login} has been created and authorized.</p>`,
				);
		},
	);
}

export async function privateRoutes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions,
) {
	/**
	 * Create/Update project
	 */
	fastify.post<{
		Body: { projectId: number; name: string; ownerId: number };
	}>(
		"/project",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			const { projectId, name, ownerId } = request.body;

			let project;

			if (projectId) {
				project = await prismaDb.project.update({
					where: {
						id: projectId,
					},
					data: {
						name,
						owner: {
							connect: {
								id: ownerId,
							},
						},
					},
				});
			} else {
				project = await prismaDb.project.create({
					data: {
						name,
						owner: {
							connect: {
								id: ownerId,
							},
						},
					},
				});
			}

			reply.send({ success: true, projectId: project.id });
		},
	);

	/**
	 * Get user projects
	 */
	fastify.get<{ Body: { ownerId: number } }>(
		"/project",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			const { ownerId } = request.body;

			const user = await prismaDb.user.findUnique({
				where: {
					id: Number(ownerId),
				},
				include: {
					projects: true,
				},
			});

			reply.send({ success: true, projects: user?.projects || [] });
		},
	);

	/**
	 * Save project diff
	 */
	fastify.post(
		"/change",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			const { diff, projectId, authorId } = request.body as never;

			const project = await prismaDb.project.findUnique({
				where: {
					id: projectId,
				},
			});
			if (!project) {
				reply.send({ success: false });
				return;
			}

			const author = await prismaDb.user.findUnique({
				where: {
					id: authorId,
				},
			});
			if (!author) {
				reply.send({ success: false });
				return;
			}

			await prismaDb.change.create({
				data: {
					diff,
					author: {
						connect: {
							id: authorId,
						},
					},
					project: {
						connect: {
							id: project.id,
						},
					},
				},
			});

			reply.send({ success: true });
		},
	);

	/**
	 * Get project diff
	 */
	fastify.get(
		"/change",
		{
			preHandler: fastify.auth([fastify.verifyUser]),
		},
		async function (request, reply) {
			const { projectId } = request.query as never;

			const change = await prismaDb.change.findUnique({
				where: {
					projectId: Number(projectId),
				},
			});

			if (!change) {
				reply.send({ success: false });
				return;
			}

			reply.send({ success: true, diff: change.diff });
		},
	);
}
