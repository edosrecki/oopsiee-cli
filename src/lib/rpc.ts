import Store from 'conf'
import axios from 'axios'
import program from 'caporal'
import { flow, isArray, isEmpty, reduce } from 'lodash'
import { isNil, join, reject, zipWith } from 'lodash/fp'
import { buildAuthorizationHeader } from '../util/authorization'

export const fetchJobResults = async (store: Store, id: string) => {
  const url = store.get('config.core.url')

  if (isEmpty(url)) {
    throw new Error(`oOPSiee server URL not defined. Run: 'oopsiee config set core.url <url>'.`)
  }

  return axios({
    method: 'GET',
    baseURL: url,
    url: `rpc/async/${id}`,
    headers: {
      Authorization: await buildAuthorizationHeader(store)
    }
  })
}

const buildArgumentSynopsis = (argDefinition: any): string => {
  if (argDefinition.variadic) {
    return `[${argDefinition.name}...]`
  } else if (argDefinition.required) {
    return `<${argDefinition.name}>`
  } else {
    return `[${argDefinition.name}]`
  }
}

const buildValidators = ({ type }: any): number | undefined => {
  if (!type) {
    return
  }

  const types = isArray(type) ? type : [type]

  return types
    .map((type: string) => (program as any)[type.toUpperCase()])
    .reduce((acc: number, validator: number) => acc | validator, 0)
}

export const addCommandArguments = (command: any, cmdDefinition: any) => {
  for (const argDefinition of cmdDefinition.arguments) {
    const synopsis = buildArgumentSynopsis(argDefinition)
    const validators = buildValidators(argDefinition)
    const defaultValue = argDefinition.required ? undefined : argDefinition.default

    command.argument(synopsis, argDefinition.description, validators, defaultValue)
  }
}

const buildFlagsSynopsis: (flags: (string|null)[]) => string =
  flow(
    zipWith((a, b) => b ? `${a}${b}` : null, ['-', '--']),
    reject(isNil),
    join(', ')
  )

const buildOptionSynopsis = (optDefinition: any): string => {
  const flags = [optDefinition.short, optDefinition.long]
  const flagsSynopsis = buildFlagsSynopsis(flags)

  if (!optDefinition.hasValue) {
    return flagsSynopsis
  }

  if (optDefinition.valueRequired) {
    return `${flagsSynopsis} <value>`
  } else {
    return `${flagsSynopsis} [value]`
  }
}

export const addCommandOptions = (command: any, cmdDefinition: any) => {
  command.option('--sync', 'Execute command synchronously')
  command.option('--async', 'Execute command asynchronously')

  for (const optDefinition of cmdDefinition.options) {
    const synopsis = buildOptionSynopsis(optDefinition)
    const validators = buildValidators(optDefinition)
    const defaultValue = optDefinition.required ? undefined : optDefinition.default

    command.option(synopsis, optDefinition.description, validators, defaultValue, !!optDefinition.required)
  }
}

const buildArgumentsMapping = (cmdDefinition: any) =>
  reduce(cmdDefinition.arguments, (acc, argument) => ({
    ...acc,
    [argument.as || argument.name]: argument.name
  }), {})

const buildOptionsMapping = (cmdDefinition: any) =>
  reduce(cmdDefinition.options, (acc, option) => {
    const name = option.long || option.short
    return {
      ...acc,
      [option.as || name]: name
    }
  }, {})

export const buildActionParams = (cmdDefinition: any, args: any, opts: any): any => {
  const argsMapping = buildArgumentsMapping(cmdDefinition)
  const argsParams = reduce(argsMapping, (acc, val, key) => ({
    ...acc,
    [key]: args[val]
  }), {})

  const optsMapping = buildOptionsMapping(cmdDefinition)
  const optsParams = reduce(optsMapping, (acc, val, key) => ({
    ...acc,
    [key]: opts[val]
  }), {})

  return { ...argsParams, ...optsParams }
}

export const buildActionPath = (cmdDefinition: any, opts: any): string => {
  if (cmdDefinition.async && !opts.sync || opts.async) {
    return 'rpc/async'
  }

  return 'rpc/sync'
}
