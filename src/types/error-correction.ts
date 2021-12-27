import { ISymbol, IToken, SymbolType } from '.'
import { EpxrType } from './parser'

export type ChekTokFunc = (tok: IToken) => boolean

export interface IErrorCorrection {
  /* Foreach Statmemnt */
  //
  foreach_after_iden(tok: IToken): void
  //
  foreach_of_first_at(): void
  //
  foreach_after_of(): void
  //
  foreach_in_expr_type(exist: EpxrType): void
  //
  foreach_after_expr(exist: EpxrType): void
  //
  body_begin(scop: number, keyword: string): void
  //
  befor_function(): void
  //
  after_end_function(): void
  /* Function Statment */
  first_follow_spec(check_first: ChekTokFunc, check_follow: ChekTokFunc): void
  //
  function_start(): void
  //
  function_in_iden(): string | null
  //
  function_skeep_tokn_not_valid(): void
  //
  function_in_return(): void
  //
  function_return_type(): SymbolType
  //
  flist_after_not_type(arg_pos: number): boolean
  //
  flist_before_type(arg_pos: number): number
  //
  expr_func_definition(): void
  //
  expr_array_index_type(symnode: ISymbol, type: SymbolType): void
  //
  expr_array_start_bracket(sym: ISymbol, type: SymbolType): boolean
  //
  expr_array_end_bracket(symnode: ISymbol): void
  //
  expr_iden_is_func(iden: ISymbol, exist: boolean): void
}
