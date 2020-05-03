import Store from 'conf'
import inquirer from 'inquirer'

export const addLoginCommands = (program: Caporal, store: Store) => {
  program
    .command('login', 'Log into oOPSiee CLI')
    .action(async () => {
      const { name, keyFile } = await inquirer.prompt([{
        name: 'name',
        message: 'Username:',
      }, {
        name: 'keyFile',
        message: 'Private key file path:',
        default: '~/.ssh/id_rsa'
      }])

      store.set('config.user.name', name)
      store.set('config.user.key-file', keyFile)
    })
}
