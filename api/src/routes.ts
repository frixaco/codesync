import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import prismaDb from "./db";

async function router(
	fastify: FastifyInstance,
	_options: FastifyPluginOptions,
) {
	fastify.get("/login/callback", async function (request, reply) {
		const token =
			await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(
				request,
			);

		token.expired();
		await token.refresh();
		await token.revoke("access_token");
		await token.revokeAll();
		token.token.access_token;
		token.token.refresh_token;
		token.token.expires_at;
		token.token.expires_in;
		token.token.token_type;

		// if later you need to refresh the token you can use
		// const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

		reply.send({ access_token: token.token.access_token });
	});
	/**
	 * Create or update project
	 */
	fastify.post("/project", {}, async (request, _reply) => {
		console.log("request.body", request.body, typeof request.body);
		const { projectId, name } = request.body as never; // ownerId

		if (projectId) {
			await prismaDb.project.update({
				where: {
					id: projectId,
				},
				data: {
					name,
					// owner: {
					//     connect: {
					//         id: ownerId,
					//     },
					// },
				},
			});
		} else {
			console.log("creating project", name);
			const result = await prismaDb.project.create({
				data: {
					name,
					// owner: {
					//     connect: {
					//         id: ownerId,
					//     },
					// },
				},
			});
			console.log("result", result);
		}

		return { success: true };
	});

	fastify.get("/project", {}, async (_request, _reply) => {
		// const { ownerId } = request.query as any;
		const projects = await prismaDb.project.findMany();
		console.log("projects", projects);

		// const user  = await prismaDb.user.findUnique({
		//     where: {
		//         id: Number(ownerId),
		//     },
		//     include: {
		//         projects: true
		//     }
		// })
		// const projects = user.projects

		return { success: true, projects };
	});

	/**
	 * Create diff for project
	 */
	fastify.post("/change", {}, async (request, reply) => {
		const { diff, projectId } = request.body as never; // authorId

		const project = await prismaDb.project.findUnique({
			where: {
				id: projectId,
			},
		});
		if (!project) {
			reply.send({ success: false });
			return;
		}

		// const author = await prismaDb.user.findUnique({
		//     where: {
		//         id: authorId,
		//     },
		// });
		// if (!author) {
		//     reply.send({ success: false });
		//     return;
		// }

		await prismaDb.change.create({
			data: {
				diff,
				// author: {
				//     connect: {
				//         id: authorId,
				//     },
				// },
				project: {
					connect: {
						id: project.id,
					},
				},
			},
		});

		return { success: true };
	});

	/**
	 * Get diff for a project
	 */
	fastify.get("/change", {}, async (request, reply) => {
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

		return { success: true, diff: change.diff };
	});
}

export default fp(router);
