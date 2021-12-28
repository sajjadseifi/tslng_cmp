export interface IPath {
  dir: string
  file: string
}
export interface IConfig {
  start: string
  path: IPath
  conf_path: string
  default_path: string
}

export const _defalut = require('./config/compiler.json') as IConfig

export const path_to_str = (path: IPath) => `${path.dir}/${path.file}`
