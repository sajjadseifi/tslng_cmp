// export type NumStr = string
// export type IdenStr = string
// export type TypeStr = string
// export type ExprStr = IdenStr | NumStr
// export type CType = IdenStr
// export type FType = [IdenStr, TypeStr]

import { IModule } from '../graph-module'
import { IGraphNode } from '../lib/graph'
import { ISymbolTable, IToken, SymbolType } from '.'
export type EpxrType = SymbolType | -1
export type Scop = string | number
export interface IParser {
  run(): void
  set_module_node(node: IGraphNode<IModule>): void
  unset_module_node(): void
  set_symbols(symbols: ISymbolTable): void
  root: ISymbolTable
  imports: string[]
}
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
