import path from 'path'
import * as fsPromises from 'fs/promises'

export const readResponseMessages = async (): Promise<any> => {
  const filePath = path.join(process.cwd(), 'src', 'response_messages.json')
  return JSON.parse(await fsPromises.readFile(filePath, { encoding: 'utf-8' }).catch((err) => { throw err }))
}
