import program from 'caporal'
import { store } from './lib/store'
import { addConfigCommands } from './commands/config'
import { addUpdateCommands } from './commands/update'
import { addRpcCommands } from './commands/rpc'

async function main () {
  program
    .name('oOPSiee')
    .bin('oopsiee')
    .version('0.0.1')

  addConfigCommands(program, store)
  addUpdateCommands(program, store)
  addRpcCommands(program, store)

  program.parse(process.argv)
}

main().catch(error => {
  console.error(error)
})
