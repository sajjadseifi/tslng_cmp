import { keywords } from './constants'
import { StatusIDEN } from './parser-rd'
import { ILogger, IPosition, ISymbol, IToken, SymbolType } from './types'
import { IFocuse } from './types/focus'
import { ILexer } from './types/lexer'
import { type_str } from './utils/type-checking'

export class Logger implements ILogger {
  constructor(public lexer: ILexer) {}
  type_mismatch_arg_func(
    arg_pos: number,
    func_name: string,
    bad_type: SymbolType,
    correct_type: SymbolType
  ): void {
    this.semantic_err(
      `mismatch type arg(${arg_pos}) of '${func_name}' is not '${type_str(
        bad_type
      )}' must be ${type_str(correct_type)}`
    )
  }
  arg_empty_call(pos: number): void {
    this.syntax_err(`empty at position ${pos} of arg call function`)
  }

  warining(message: string): void {
    console.warn(`:: warning :: ${message}`)
  }
  warn_with_pos(pos: IPosition, message: string) {
    this.warining(`${message} in row ${pos.row} and col ${pos.col}`)
  }
  declared_and_not_used(symbl: ISymbol, focuse: IFocuse | null): void {
    let str
    if (focuse && focuse.status === StatusIDEN.FOREACH) {
      str = `${keywords.FOREACH} identifier`
    } else if (symbl.is_func) {
      str = keywords.FUNCTION
    } else {
      str = keywords.VAL
    }

    this.warn_with_pos(
      symbl.position,
      `${str} '${symbl.key}' is declared but not used`
    )
  }

  identifier_not_array(tok: string | IToken): void {
    const iden = typeof tok === 'string' ? tok : tok.val!
    this.log_with_line(`The identifier ${iden} should be in type Array`)
  }
  mismatch_type(
    tok1: string,
    type1: string,
    tok2: string,
    type2: string
  ): void {
    throw new Error('Method not implemented.')
  }
  type_of_array_index(tok: string, type: string): void {
    this.log_with_line(
      `index of Array '${tok}' should be in type Int can not '${type}'`
    )
  }
  arg_defined_last(key: any, index: any, type: any): void {
    this.syntax_err(`arg ${key} defined at ${index} postion by type ${type}`)
  }
  type_ret_err(): void {
    return this.syntax_err('reutrn type must one of (Array,Int,Nil) type')
  }
  keyword_block_body(keyword: string, open: boolean = true): void {
    this.syntax_err(
      `body of ${keyword} be ${open ? 'started' : 'ended'} with ${
        open ? "':'" : "'end'"
      } token`
    )
  }
  illegal_error(message: string): void {
    this.syntax_err(`illegal ${message}`)
  }
  illegal_keyword(keyword: string): void {
    this.illegal_error(`illegal keyword  token '${keyword}' in place`)
  }
  capsolate_syntax_err(tok: string, open: boolean): void {
    this.syntax_err(
      `you shude be ${
        open ? 'open' : 'close'
      } the capsolate expersion with ${tok}`
    )
  }
  block_opcl_err(open: boolean = true, token: string): void {
    this.syntax_err(
      `you need to ${
        open ? 'open' : 'close'
      } block near token '${token}' with ${open ? ':' : 'end'}`
    )
  }
  type_invalid_err(token: IToken): void {
    this.syntax_err(`invalid type ${token} valid type is (Array,Nil,Int)`)
  }
  correct_word_place(token: IToken, word: string): void {
    return this.syntax_err(`near token '${token.val}' mus be '${word}'`)
  }
  is_decleared(token: string): void {
    this.syntax_err(`identifier '${token}' is decleard.`)
  }
  syntax_err(message: string): void {
    this.log_with_line(`:: syntax error :: ${message}`)
  }
  semantic_err(message: string): void {
    this.log_with_line(`:: semantic error :: ${message}`)
  }
  exit_log(message: string): -1 {
    console.log(message)
    return -1
  }
  exit_logline(message: string): -1 {
    console.log(this.lexer.counter_line, message)
    return -1
  }

  log(message: string): void {
    console.log(message)
  }

  log_with_line(message: string): void {
    console.log(this.lexer.counter_line, message)
  }

  expected_arg(iden: string, expects: number, given: number): void {
    this.log_with_line(
      `function "${iden}" expects ${expects} arguments but only ${given} given!`
    )
  }

  not_defind(iden: string): void {
    this.log_with_line(`identifier "${iden}" is not defined!`)
  }

  wrong_type_arg(iden: string, arg_index: number): void {
    this.log_with_line(`wrong type for argument ${arg_index} of "${iden}"!`)
  }

  wrong_type_return(iden: string): void {
    this.log_with_line(`returning a value with wrong type from "${iden}"!`)
  }
}
