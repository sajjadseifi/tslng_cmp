export interface IPath {
  dir: string
  file: string
}
export interface IApp {
  start: string
  path: IPath
}
export interface IConfig {
  app: IApp
  def: IPath
  pck: IPath
  conf_path: string
  default_path: string
}

export const _defalut = require('./config/compiler.json') as IConfig

export class ConfigurManagemnt {
  constructor(public config: IConfig = _defalut) {}
  init() {
    console.log(this.config)
    // this.config.app = this. ?? this.config.default_path
  }
  get def_path() {
    return this.path_to_str(this.config.def)
  }
  get app_path() {
    return this.path_to_str(this.config.app.path)
  }
  private path_to_str(path: IPath) {
    return `${path.dir}/${path.file}`
  }
}
