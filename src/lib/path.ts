import path from 'path'
import fs from 'fs'
import { glob } from 'glob'

export const BASE_ROUTE = './'
export enum FileExtention {
  HTES = '.htes',
  TES = '.tes'
}

export interface IPath {
  dir: string
  file: string
  suffix: FileExtention
  get is_tes(): boolean
  get is_htes(): boolean
}

export interface IPathTes {
  files_in_dir(dir: string, ext?: FileExtention): string[]
  get base(): string
  path_to_dir(_path: IPath, full?: boolean): string
  path_to_str(_path: IPath, full?: boolean): string
  path_in_base(): string
  nested_files(dir: string, full?: boolean): string[]
}
export class Path implements IPath {
  dir: string
  file: string
  suffix: FileExtention
  constructor(_path: string) {
    this.dir = path.dirname(_path).normalize()
    this.file = path.basename(_path)
    this.suffix = path.extname(_path) as FileExtention
  }
  
  get is_tes() {
    return this.suffix === FileExtention.TES
  }
  get is_htes() {
    return this.suffix === FileExtention.HTES
  }
}

export class PathTes implements IPathTes {
  constructor(public base_route: string = BASE_ROUTE) {
    this.init()
  }
  nested_files(dir: string, full?: boolean): string[] {
    let res: string[] = []
    glob(path.join(dir, '/**/*'), (err, matches) => {
      if (err) {
        console.log('Error', err)
      } else {
        res = matches
      }
    })

    return res
  }
  path_in_base(): string {
    return ''
  }
  private init() {}
  full_path(...pathParams: string[]): string {
    return path.resolve(this.base_route, ...pathParams).normalize()
  }
  to_full(...pathes: []): string[] {
    return pathes.map((p) => this.full_path(p))
  }
  files_in_dir(dir: string, ext?: FileExtention): string[] {
    const files: string[] = []
    fs.readdirSync(dir).map((fname) => {
      const _pth = this.full_path(dir, fname)
      const file = path.resolve(_pth)
      //if file directory
      if (fs.lstatSync(file).isDirectory()) return
      //if extention exist and diffrent with file readed extention return
      if (ext && path.extname(file) !== ext) return
      //push to files + ext
      files.push(file)
    })

    return files
  }
  get base(): string {
    return this.full_path()
  }
  path_to_dir(_path: IPath, full: boolean = false) {
    const prev = full ? this.base + '/' : ''
    return path.normalize(`${prev}${_path.dir}/`)
  }
  path_to_str(_path: IPath, full: boolean = false) {
    const pdir = this.path_to_dir(_path, full) + _path.file
    return path.normalize(pdir)
  }
}
