import Store from 'conf'
import moment from 'moment'
import ora from 'ora'
import { isEmpty } from 'lodash'
import { update } from './update'

const shouldAutoUpdate = (store: Store): boolean => {
  const commands = store.get('commands', {})
  const isAutoUpdateOn = store.get('config.core.auto-update', false)
  const lastUpdate = store.get('meta.last-update', '0000-01-01')
  const updateInterval = store.get('config.core.update-interval', 24)

  const hasNoCommands = isEmpty(commands)
  const needsAutoUpdate = isAutoUpdateOn && moment().diff(lastUpdate, 'hours') > updateInterval

  return hasNoCommands || needsAutoUpdate
}

export const autoUpdate = async (store: Store) => {
  const spinner = ora('Updating commands definitions.')

  try {
    if (shouldAutoUpdate(store)) {
      spinner.start()
      await update(store)
    }
  } catch (error) {
    console.error(error.response.data)
  } finally {
    spinner.stop()
  }
}
