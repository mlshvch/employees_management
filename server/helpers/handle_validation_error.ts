import { GraphQLError } from 'graphql'
import { logger } from '../src/logger'

export const handleValidationError = (err: Error | GraphQLError): GraphQLError => {
  if (err instanceof GraphQLError) {
    return err
  } else {
    logger.error(err)
    return new GraphQLError('Internal error')
  }
}
