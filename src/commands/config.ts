import Store from 'conf'
import flatten from 'flat'
import { identity, join, map } from 'lodash'
import { Parser, toBoolean, toInt } from '../util/parsers'

const parsers: { [variable: string]: Parser } = {
  'core.auto-update': toBoolean,
  'core.update-interval': toInt,
}

export const addConfigCommands = (program: Caporal, store: Store) => {
  program
    .command('config path', 'Print path to a config file')
    .action(() => {
      console.log(store.path)
    })

  program
    .command('config set', 'Set a value of a config variable')
    .argument('<variable>', 'Variable name')
    .argument('<value>', 'Value')
    .action(({ variable, value }: any) => {
      const parser = parsers[variable] || identity

      store.set(`config.${variable}`, parser(value))
    })

  program
    .command('config get', 'Print a value of a config variable')
    .argument('<variable>', 'Variable name')
    .action(({ variable }: any) => {
      const value = store.get(`config.${variable}`)

      console.log(value)
    })

  program
    .command('config list', 'Print values of all config variables')
    .alias('config ls')
    .action(() => {
      const variables = map(
        flatten(store.get('config')),
        (value, variable) => `${variable}=${value || ''}`,
      )

      console.log(join(variables, '\n'))
    })
}
