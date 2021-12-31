import { FileExtention } from 'src/lib/path'
import { IModule } from '../graph-module'
import { IGraphNode } from '../lib/graph'
import { IRunner, ISymbolTable, IToken, Nullable, SymbolType } from '../types'
import { EpxrType } from '../types/parser'
import { Parser } from './parser'
import { PME } from './PME'

export enum StatusIDEN {
  FREE,
  CALL,
  DEFINED,
  FOREACH
}
export enum ParserMode {
  IMP, //import module
  PRE, //pre parse
  PARSE, //during parse
  POST //post parse
}

export interface IParser {
  parse(): void
}

export class SubParser implements IParser {
  constructor(public parser: Parser) {}
  parse(): void {
    throw new Error('You Need Impliments Parse Method In Child Of SubParser.')
  }
}
export type SubParserTT = typeof SubParser

export interface IParsMode {
  parser: IParser
  mode: ParserMode
}
export interface KeyPME {
  mod: ParserMode
  ext: FileExtention
}
export interface IPME {
  key: KeyPME
  parser: SubParserTT
}
//base root of parser
export interface IParserBase {
  execute(__SP__?: Nullable<SubParserTT>): void
  set_module_node(node: IGraphNode<IModule>): void
  unset_module_node(): void
  set_symbols(symbols: ISymbolTable): void
  new_PME(parser: SubParserTT, mode: ParserMode, ext: FileExtention): void
  root: ISymbolTable
  imports: string[]
  parsers: PME
}
//recursive diecent
export interface IParserRD {
  prog(): void //
  func(): boolean //
  body(): boolean //
  stmt(): boolean //
  defvar(): boolean //
  expr(): EpxrType //
  flist(size: number): number //
  clist(): number //
  type(): SymbolType | IToken //
  num(): IToken //
  iden(): IToken //
}
