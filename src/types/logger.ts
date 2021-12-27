import { ISymbol, IToken } from '.'

export interface ILogger {
  log(message: string): void
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
  type_err(token: IToken, word: string): void
  block_opcl_err(open: boolean, token: string): void
  capsolate_syntax_err(tok: string, open: boolean): void
  illegal_error(message: string): void
  illegal_keyword(keyword: string): void
  keyword_block_body(keyword: string, open: boolean): void
  ret_type_err(): void
  arg_defined_last(key: any, index: any, type: any): void
  mismatch_type(tok1: string, type1: string, tok2: string, type2: string): void
  type_of_array_index(tok: string, type: string): void
  identifier_not_array(tok: IToken | string): void
  declared_and_not_used(symbol: ISymbol): void
}
