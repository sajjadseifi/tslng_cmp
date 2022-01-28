import {  IPath, IPathTes } from './lib/path'

export interface IApp {
  start: string
  path: IPath
}
export interface IBuitin{
  dir:string
  proc: IPath
  def: IPath
  glob: IPath
}
export interface IConfig {
  app: IApp
  builtin:IBuitin
  out: IPath
  pck: IPath
  conf_path: string
  default_path: string
  base_route: string
  full_path: string
}

export const _defalut = require('./config/compiler.json') as IConfig

export class ConfigurManagemnt {
  constructor(public tpath: IPathTes, public config: IConfig = _defalut) {
    this.override();
  }
  override(){
    _defalut.builtin.def.dir = this.builtindir_or_pathdir(_defalut.builtin,_defalut.builtin.def);
    _defalut.builtin.glob.dir = this.builtindir_or_pathdir(_defalut.builtin,_defalut.builtin.glob);
    _defalut.builtin.proc.dir = this.builtindir_or_pathdir(_defalut.builtin,_defalut.builtin.proc);
  }
  builtindir_or_pathdir(path1:IBuitin,path2:IPath){
    return path1.dir ?? path2.dir
  }
  init() {}
  get def_path() {
    return this.tpath.path_to_str(this.config.builtin.def, true)
  }
  get app_path() {
    return this.tpath.path_to_str(this.config.app.path, true)
  }
  is_start(func_name: String) {
    return func_name === this.config.app.start
  }
}
