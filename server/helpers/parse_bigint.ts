export const parseJSONBigIntToNumber = (object: object) => {
  return JSON.parse(JSON.stringify(object, (_, v) => typeof v === 'bigint' ? Number(v) : v))
}
