import * as fs from 'fs'
import Store from 'conf'
import { sign } from 'jsonwebtoken'

const loadKey = (store: Store): Buffer => {
  const filePath = store.get('config.user.key-file')
  return fs.readFileSync(filePath)
}

export const buildAuthorizationHeader = (store: Store): string => {
  const user = store.get('config.user.name')
  const privateKey = loadKey(store)

  const token = sign({ user }, privateKey, { algorithm: 'RS256' })
  return `Bearer ${token}`
}

