export interface IConfig {
  start: string
  path: string
  conf_path: string
  default_path: string
}

export const _defalut = require('./config/compiler.json') as IConfig
