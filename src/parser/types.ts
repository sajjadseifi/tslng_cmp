import { FileExtention } from '../lib/path'
import { IModule } from '../graph-module'
import { IGraphNode } from '../lib/graph'
import {
  DeepPartial,
  IRunner,
  ISymbolTable,
  IToken,
  LogingAquiredStatus,
  Nullable,
  SymbolType
} from '../types'
import { EpxrType } from '../types/parser'
import { Parser } from './parser'
import { PME } from './PME'
import { Compiler, SharedCompier } from '../compiler'
import { ConceptualValues, ExprCV } from './tes-parser'

export enum StatusIDEN {
  FREE,
  CALL,
  DEFINED,
  FOREACH
}
export enum ParserMode {
  SRART,
  IMP, //import module
  PRE, //pre parse
  PARSE, //during parse
  POST, //post parse
  FINISHED //post parse
}
export const strble_mode_parse: string[] = [
  'SRART',
  'IMP',
  'PRE',
  'PARSE',
  'POST',
  'FINISHED'
]

export interface IParser {
  parse(): void
}

export class SubParser implements IParser {
  
  constructor(public compiler: SharedCompier) {
  }
  get parser():Parser{
    return this.compiler.parser as Parser
  }
  parse(): void {
    throw new Error('You Need Impliments Parse Method In Child Of SubParser.')
  }
}
export type SubParserTT = typeof SubParser

export interface IParsMode {
  parser: IParser
  mode: ParserMode
}
interface Statuses {
  suggest: boolean
  log: LogingAquiredStatus
}
export type ParserStatuses = DeepPartial<Statuses>

export interface KeyPME {
  mod: ParserMode
  ext: FileExtention
}
export interface IPME {
  key: KeyPME
  parser: SubParserTT
  stuses?: ParserStatuses
}
//base root of parser
export interface IParserBase {
  execute(__SP__?: Nullable<SubParser>, status?: ParserStatuses): void
  set_module_node(node: IGraphNode<IModule>): void
  unset_module_node(): void
  set_symbols(symbols: ISymbolTable): void
  root: ISymbolTable
  imports: string[]
  can_run:boolean
}
//recursive diecent
export interface IParserRD {
  prog(): void //
  func(): void //
  body(): boolean //
  stmt(): boolean //
  defvar(): boolean //
  expr(): ConceptualValues<EpxrType,ExprCV | null> //
  flist(size: number,saved_arg?:boolean): number //
  clist(): number //
  type(): SymbolType | IToken //
  num(): IToken //
  iden(): IToken //
}
