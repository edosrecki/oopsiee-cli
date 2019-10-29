import program from 'caporal'
import { version } from './version'
import { store } from './lib/store'
import { addConfigCommands } from './commands/config'
import { addUpdateCommands } from './commands/update'
import { addRpcCommands } from './commands/rpc'
import { autoUpdate } from './lib/auto-update'

async function main () {
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

main().catch(error => {
  console.error(error)
})
