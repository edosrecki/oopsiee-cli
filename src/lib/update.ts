import axios from 'axios'
import Store from 'conf'
import yaml from 'js-yaml'
import { isEmpty } from 'lodash'
import moment from 'moment'

export const update = async (store: Store) => {
  const url = store.get('config.core.url')

  if (isEmpty(url)) {
    throw new Error(`oOPSiee server URL not defined. Run: 'oopsiee config set core.url <url>'.`)
  }

  const { data } = await axios({
    method: 'GET',
    baseURL: url,
    url: 'commands',
  })

  const commands = yaml.safeLoad(data)
  store.set('commands', commands)
  store.set('meta.last-update', moment().toISOString())
}
