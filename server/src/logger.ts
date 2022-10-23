import path from 'path'
import pino from 'pino'
import * as fs from 'fs'
import { prisma } from '../db'
import { main as createLogFile } from '../scripts/create_log_file'
export const logFileDir: string = path.join(process.cwd(), 'logs')
export const logFilePath: string = path.join(logFileDir, '.log')

createLogFile()

const defineStreams = (): Array<{ stream: any }> => {
  const streams: Array<{ stream: any }> = [{ stream: fs.createWriteStream(logFilePath) }]
  const env: string | undefined = process.env.NODE_ENV
  if (env) {
    if (['development', 'production'].includes(env)) streams.push({ stream: process.stdout })
  }
  return streams
}

export const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL ?? 'info',
    formatters: {
      level: (label) => {
        return { level: label }
      }
    }
  },
  pino.multistream(defineStreams())
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
