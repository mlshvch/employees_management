import path from 'path'
import * as fsPromises from 'fs/promises'

export interface ResponseMessages {
  'common': {
    'forbidden': string
    'internalError': string
  }
  'department': {
    'error': {
      'blankName': string
      'invalidManager': string
      'notExist': string
      'nameAlreadyTaken': string
    }
  }
  'employee': {
    'error': {
      'invalidUser': string
      'userAlreadyTaken': string
      'invalidPosition': string
      'invalidDepartment': string
      'notExist': string
      'blankName': string
      'blankSurname': string
      'invalidName': string
      'invalidSurname': string
    }
  }
  'position': {
    'error': {
      'blankName': string
      'nameAlreadyTaken': string
      'notExist': string
    }
  }
}

export const readResponseMessages = async (): Promise<any> => {
  const filePath = path.join(process.cwd(), 'src', 'response_messages.json')
  return JSON.parse(await fsPromises.readFile(filePath, { encoding: 'utf-8' }).catch((err) => {
    throw err
  }))
}
