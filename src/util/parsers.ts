export type Parser<T = any> = (value: string) => T

const trueValues = new Set(['true', 'yes', 'on', '1'])

export const toInt = (value: string): number =>
  parseInt(value, 10)

export const toBoolean = (value: string): boolean =>
  trueValues.has(value)
