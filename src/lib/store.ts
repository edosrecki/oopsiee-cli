import Store from 'conf'
import yaml from 'js-yaml'

export const store = new Store({
  projectSuffix: '',
  fileExtension: 'yaml',
  serialize: yaml.safeDump,
  deserialize: yaml.safeLoad,
  defaults: {
    config: {
      core: {
        'url': '',
        'auto-update': false,
        'update-interval': 24
      },
      user: {
        'name': '',
        'key-file': ''
      }
    },
    meta: {
      'last-update': ''
    },
    commands: {}
  }
})
