const toBuffer = (input: any): Buffer => {
  if (Buffer.isBuffer(input)) {
    return input
  }

  if (typeof input === 'string') {
    return Buffer.from(input, 'utf8')
  }

  return Buffer.from(JSON.stringify(input), 'utf8')
}

export const base64Url = (input: any): string =>
  toBuffer(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
