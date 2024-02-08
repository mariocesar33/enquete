import { FastifyInstance } from "fastify"
import z from "zod"

import { prisma } from "../../lib/prisma"

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const createPollParams = z.object({
      pollId: z.string().uuid(),
    })
  
    const { pollId } = createPollParams.parse(request.params)
  
    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId
      },
      // vem todos os dados da options
      // include: {
      //   options: true,
      // }
      // apenas campos especificos do options
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      }
    })
  
    return reply.send({ poll })
  })
}