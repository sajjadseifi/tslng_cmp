import path from 'path'
import fs from 'fs'
import { FileExtention, IPath, IPathTes } from './lib/path'

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
  base_route: string
  full_path: string
}

export const _defalut = require('./config/compiler.json') as IConfig

export class ConfigurManagemnt {
  constructor(public tpath: IPathTes, public config: IConfig = _defalut) {}
  init() {}
  get def_path() {
    return this.tpath.path_to_str(this.config.def, true)
  }
  get app_path() {
    return this.tpath.path_to_str(this.config.app.path, true)
  }
  is_start(func_name: String) {
    return func_name === this.config.app.start
  }
}
