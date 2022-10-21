import path from 'path'
import pino from 'pino'
import * as fs from 'fs'
import { prisma } from '../db'

export const logFilePath: string = path.join(__dirname, 'logs/.log')

fs.open(logFilePath, 'a', (err) => {
  if (err != null) throw err
})

const streams: Array<{ stream: any }> = [
  { stream: process.stdout },
  { stream: fs.createWriteStream(logFilePath) }
]

export const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL ?? 'info',
    formatters: {
      level: (label) => {
        return { level: label }
      }
    }
  },
  pino.multistream(streams)
)

prisma.$on('query', (e) => {
  logger.info(`QUERY: ${e.query}\nPARAMS: ${e.params}\nDURATION: ${e.duration} ms`)
})

prisma.$on('warn', (e) => {
  logger.warn(e)
})

prisma.$on('error', (e) => {
  logger.error(e)
})

prisma.$on('info', (e) => {
  logger.info(e)
})
