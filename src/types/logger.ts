import { IPosition, ISymbol, IToken, SymbolType } from '.'
import { IFocuse } from './focus'

export interface ILogger {
  log(message: string): void
  warining(message: string): void
  log_with_line(message: string): void
  syntax_err(message: string): void
  semantic_err(message: string): void
  not_defind(iden: string): void
  wrong_type_arg(iden: string, arg_index: number): void
  expected_arg(iden: string, expected: number, given: number): void
  wrong_type_return(iden: string): void
  exit_log(message: string): -1
  exit_logline(message: string): -1
  is_decleared(token: string): void
  correct_word_place(token: IToken, word: string): void
  block_opcl_err(open: boolean, token: string): void
  capsolate_syntax_err(tok: string, open: boolean): void
  illegal_error(message: string): void
  illegal_keyword(keyword: string): void
  keyword_block_body(keyword: string, open: boolean): void
  type_ret_err(): void
  type_invalid_err(token: IToken): void
  type_of_array_index(tok: string, type: string): void
  arg_defined_last(key: any, index: any, type: any): void
  mismatch_type(tok1: string, type1: string, tok2: string, type2: string): void
  identifier_not_array(tok: IToken | string): void
  warn_with_pos(pos: IPosition, message: string): void
  type_mismatch_arg_func(
    arg_pos: number,
    func_name: string,
    bad_type: SymbolType,
    correct_type: SymbolType
  ): void
  arg_empty_call(pos: number): void
}
