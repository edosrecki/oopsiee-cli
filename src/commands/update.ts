import Store from 'conf'
import { isNil } from 'lodash'
import { update } from '../lib/update'

export const addUpdateCommands = (program: Caporal, store: Store) => {
  program
    .command('update', 'Update commands definition')
    .action(async () => {
      try {
        await update(store)
      } catch (error) {
        const data = isNil(error.response) ? { message: error.message } : error.response.data
        console.error(data)
      }
    })
}
