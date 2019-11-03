import Store from 'conf'
import yaml from 'js-yaml'

export const store = new Store({
  projectName: 'oopsiee',
  projectSuffix: '',
  fileExtension: 'yaml',
  serialize: yaml.safeDump,
  deserialize: yaml.safeLoad,
  defaults: {
    config: {
      core: {
        'url': 'https://oopsiee.herokuapp.com/',
        'auto-update': true,
        'update-interval': 24
      },
      user: {
        'name': '',
        'key-file': '',
        'ssh-agent-socket': ''
      }
    },
    commands: {}
  }
})
