import Store from 'conf'
import { update } from '../lib/update'

export const addUpdateCommands = (program: Caporal, store: Store) => {
  program
    .command('update', 'Update commands definition')
    .action(async () => {
      try {
        await update(store)
      } catch (error) {
        console.error(error.response.data)
      }
    })
}
