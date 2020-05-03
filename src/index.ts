import program from 'caporal'
import { addConfigCommands } from './commands/config'
import { addRpcCommands } from './commands/rpc'
import { addUpdateCommands } from './commands/update'
import { autoUpdate } from './lib/auto-update'
import { store } from './lib/store'
import { version } from './version'

async function main() {
  await autoUpdate(store)

  program
    .name('oOPSiee')
    .bin('oopsiee')
    .version(version)

  addConfigCommands(program, store)
  addUpdateCommands(program, store)
  addRpcCommands(program, store)

  program.parse(process.argv)
}

main().catch((error) => {
  console.error(error)
})
