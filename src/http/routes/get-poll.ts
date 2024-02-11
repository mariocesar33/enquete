import { FastifyInstance } from "fastify"
import z from "zod"

import { prisma } from "../../lib/prisma"
import { redis } from "../../lib/redis"

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

    if (!poll) {
      return reply.status(400).send({ message: "poll not found." })
    }

    // -1 => quer dizer que eu quero todas
    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

    //console.log(result) 
    // [
    //  '81869c79-7411-481e-b41d-0189cede3645',
    //  '0',
    //  '6ba1b27b-facf-4449-886b-ac946460c127',
    //  '1'
    // ]

    // converter um array para chave e valor
    const votes = result.reduce((obj, line, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1]

        Object.assign(obj, { [line]: Number(score) })
      }

      return obj
    }, {} as Record<string, number>)

    console.log(votes)
    // {
    //   '81869c79-7411-481e-b41d-0189cede3645': 0,
    //   '6ba1b27b-facf-4449-886b-ac946460c127': 1
    // }
  
    // este conteudo esta na aula 3 no minuti 24:25
    return reply.send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map(option => {
          return {
            id: option.id,
            title: option.title,
            score: (option.id in votes) ? votes[option.id] : 0,
          }
        })
      }
    })
  })
}