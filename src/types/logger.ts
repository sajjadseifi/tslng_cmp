import { IModule } from '../graph-module'
import { IPosition, IToken, SymbolType } from '.'
import { EpxrType } from './parser'
import { KeySymbol } from './symbol'
export interface LogingAquiredStatus {
  warning: boolean
  syntax: boolean
  semantic: boolean
  error: boolean
}
export interface ILogger {
  set_loging_status(stts?: Partial<LogingAquiredStatus>): void
  reset(): void
  set_module(modl: IModule): void
  log(message: string): void
  warining(message: string, pos?: IPosition, strict?: boolean): void
  log_with_line(message: string, pos?: IPosition, strict?: boolean): void
  syntax_err(message: string, pos?: IPosition, strict?: boolean): void
  semantic_err(message: string, pos?: IPosition, strict?: boolean): void
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
  not_found_start_func(starter?: string): void
  word_not_iden(word: string): void
  expect_sem_error(): void
  incompatible_oprands():void
  mismatch_type_conditional(tpye1:EpxrType,typ2:EpxrType):void
  ret_type_mismatch(fname:KeySymbol,ftype:number,badtype:number):void
}
