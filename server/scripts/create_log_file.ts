import * as fs from 'fs'
import { logFileDir, logFilePath } from '../src/logger'

export const main = (): void => {
  fs.mkdir(logFileDir, (err) => {
    if (err != null) console.log(err)
  })
  fs.open(logFilePath, 'a', (err) => {
    if (err != null) throw err
  })
}
