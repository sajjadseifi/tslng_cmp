// export type NumStr = string
// export type IdenStr = string
// export type TypeStr = string
// export type ExprStr = IdenStr | NumStr
// export type CType = IdenStr
// export type FType = [IdenStr, TypeStr]

import { IToken, SymbolType } from '.'
export type EpxrType = SymbolType | -1
export type Scop = string | number
export interface IParser {
  run(): void
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
