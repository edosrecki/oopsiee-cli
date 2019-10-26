import Store from 'conf'
import axios from 'axios'
import { isEmpty } from 'lodash'
import { addCommandArguments, addCommandOptions, buildActionParams, buildActionPath, fetchJobResults } from '../lib/rpc'
import { buildAuthorizationHeader } from '../util/authorization'

export const addRpcCommands = (program: Caporal, store: Store) => {
  program
    .command('job', 'Fetch job results')
    .argument('<id>', 'Job ID')
    .action(async ({ id }: any) => {
      try {
        const { data } = await fetchJobResults(store, id)
        console.log(data)
      } catch (error) {
        console.error(error.response.data)
      }
    })

  const definitions = store.get('commands')
  if (isEmpty(definitions)) {
    return
  }

  for (const namespace in definitions) {
    for (const definition of definitions[namespace]) {
      addRpcCommand(store, program, namespace, definition)
    }
  }
}

const addRpcCommand = (store: Store, program: Caporal, namespace: string, definition: any) => {
  const url = store.get('config.core.url')
  const command = program.command(`${namespace} ${definition.command}`, definition.description)

  if (definition.alias) {
    command.alias(`${namespace} ${definition.alias}`)
  }

  addCommandArguments(command, definition)
  addCommandOptions(command, definition)

  command.action(async (args, opts) => {
    const params = buildActionParams(definition, args, opts)
    const path = buildActionPath(definition, opts)

    try {
      const { data } = await axios({
        method: 'POST',
        baseURL: url,
        url: path,
        headers: {
          Authorization: buildAuthorizationHeader(store)
        },
        data: {
          procedure: definition.action,
          params
        }
      })

      console.log(data)
    } catch (error) {
      console.error(error.response.data)
    }
  })
}
