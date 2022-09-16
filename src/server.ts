import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes, convertMinutesToHourString } from './utils'

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
  log: ['query']
})

// HTTP methods / API RESful

// GET, POST, PUT, PATCH e DELETE

/* HTTP Codes
    - 2xx: Success
      - 201: Created

    - 3xx: Redirects

    - 4xx: Error App
      - 404 - Not Found

    - 5xx: Unexpected Error
*/

/**
 *  Query Params: http://localhost:3333/ads?page=2
 *  Route: http://localhost:3333/ads/5 // http://localhost:3333/ads/como-criar-uma-api-node
 *  Body: forms/object
*/


app.get('/games', async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
        }
      }
    }
  })

  return res.json(games)
})

app.get('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      gameId: true,
      name: true,
      yearsPlaying: true,
      weekDays: true,
      hourStart: true,
      hourEnd: true,
      useVoiceChannel: true,
      game: true
    },
    where: {
      gameId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return res.json(ads.map(ad => ({
    ...ad,
    weekDays: ad.weekDays.split(','),
    hourStart: convertMinutesToHourString(ad.hourStart),
    hourEnd: convertMinutesToHourString(ad.hourEnd),
  })))
})

app.post('/games/:id/ads', async (req, res) => {
  const body: any = req.body

  const gameId = req.params.id

  const ad = await prisma.ad.create({
    data: {
      ...body,
      weekDays: body.weekDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      gameId
    }
  })

  return res.status(201).json(ad)
})

app.get('/ads/:id/discord', async (req, res) => {
  const adId = req.params.id

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true
    },
    where: {
      id: adId
    }
  })

  return res.json({
    discord: ad.discord
  })
})

app.listen(3333, () => console.log('Listen server port on 3333'))
