import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import prismaDb from "./db";

async function router(
	fastify: FastifyInstance,
	_options: FastifyPluginOptions,
) {
	/**
	 * Authorization callback URL to finish authorization
	 */
	fastify.get("/github", {}, async function (request, reply) {
		const code = (request.query as any).code;
		const state = (request.query as any).state;
		console.log(`
        code: ${code};
        state: ${state}
        `);
		return { success: true };
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
