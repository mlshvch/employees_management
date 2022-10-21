import * as fs from 'fs'
import { logFilePath } from '../src/logger'
import ErrnoException = NodeJS.ErrnoException

fs.open(logFilePath, 'a+', (err: ErrnoException | null, _fd: number) => { if (err != null) throw err })
