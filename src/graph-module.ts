import { FD } from './io'
import { IPath } from './lib/path'
import { ParserMode } from './parser/types'
import { SymbolTable } from './symbol'
import { ILexProps, ISymbolTable } from './types'

export interface IModule {
  symbols: ISymbolTable
  plex: ILexProps
  complex: ILexProps
  path: IPath
  mode: ParserMode
  get is_imp(): boolean
  get is_pre(): boolean
  get is_parse(): boolean
  get is_post(): boolean
  update_plex(): void
  update_complex(): void
  set_complex(fd: FD, index: number): void
  set_plex(fd: FD, index: number): void
  set_mod: (mode: ParserMode) => ParserMode
  imp: () => ParserMode
  pre: () => ParserMode
  parse: () => ParserMode
  post: () => ParserMode
}

export class Module implements IModule {
  symbols: ISymbolTable
  plex!: ILexProps
  complex!: ILexProps
  constructor(public path: IPath, public mode: ParserMode = ParserMode.IMP) {
    this.symbols = new SymbolTable()
    this.set_complex(-1, -1)
    this.update_plex()
  }

  set_complex(fd: number, index: number): void {
    this.complex = { fd, index }
  }
  set_plex(fd: number, index: number): void {
    this.plex = { fd, index }
  }
  update_complex(): void {
    this.complex = this.plex
  }
  update_plex(): void {
    this.plex = this.complex
  }
  set_mod = (mode: ParserMode) => (this.mode = mode)

  imp = () => this.set_mod(ParserMode.IMP)

  pre = () => this.set_mod(ParserMode.PRE)

  parse = () => this.set_mod(ParserMode.PARSE)

  post = () => this.set_mod(ParserMode.POST)

  get is_imp(): boolean {
    return this.mode === ParserMode.IMP
  }
  get is_pre(): boolean {
    return this.mode === ParserMode.PRE
  }
  get is_parse(): boolean {
    return this.mode === ParserMode.PARSE
  }
  get is_post(): boolean {
    return this.mode === ParserMode.POST
  }
}
