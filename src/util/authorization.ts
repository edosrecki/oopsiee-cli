import fs from 'fs'
import crypto from 'crypto'
import chalk from 'chalk'
import inquirer from 'inquirer'
import Store from 'conf'
import { sign } from 'jsonwebtoken'

const promptPassword = async (prefixMessage?: string): Promise<string> => {
  let prefix = chalk.green('?')
  if (prefixMessage) {
    prefix = `${prefix} ${prefixMessage}`
  }

  const { password } = await inquirer.prompt([{
    type: 'password',
    name: 'password',
    message: 'Key passphrase:',
    prefix
  }])

  return password
}

const loadKey = async (store: Store, passphrase?: string): Promise<string> => {
  const filePath = store.get('config.user.key-file')

  try {
    return crypto
      .createPrivateKey({
        key: fs.readFileSync(filePath),
        passphrase
      })
      .export({
        format: 'pem',
        type: 'pkcs1'
      }) as string

  } catch (error) {
    if (error.code === 'ERR_MISSING_PASSPHRASE') {
      const password = await promptPassword()
      return await loadKey(store, password)
    }
    if (error.code === 'ERR_OSSL_EVP_BAD_DECRYPT') {
      const password = await promptPassword('Incorrect, try again.')
      return await loadKey(store, password)
    }

    throw error
  }
}

export const buildAuthorizationHeader = async (store: Store): Promise<string> => {
  const user = store.get('config.user.name')
  const privateKey = await loadKey(store)

  const token = sign({ user }, privateKey, { algorithm: 'RS256' })
  return `Bearer ${token}`
}
