import * as fs from 'fs'
import { logFileDir, logFilePath } from '../src/logger'

const main = async (): Promise<void> => {
  await fs.mkdir(logFileDir, (err) => {
    if (err != null) console.log(err)
  })
  await fs.open(logFilePath, 'a', (err) => {
    if (err != null) throw err
  })
}

main().catch((err) => {
  if (err) throw err
})
