import { IConfig } from './config'
import { keywords } from './constants'
import { StatusIDEN } from './parser-rd'
import { ILogger, IPosition, ISymbol, IToken, SymbolType } from './types'
import { IFocuse } from './types/focus'
import { ILexer } from './types/lexer'
import { type_str } from './utils/type-checking'
import colors from 'colors/safe'
const incld_qute = (str: string = '', color: any) => {
  return `'${color(str)}'`
}
const type_qute = (str: string) => incld_qute(str, colors.cyan)
const iden_qute = (str: string) => incld_qute(str, colors.yellow)
const kword_qute = (str: string) => incld_qute(str, colors.magenta)
const num_qute = (num: any) => incld_qute(num, colors.yellow)

export class Logger implements ILogger {
  constructor(public lexer: ILexer, public config: IConfig) {}
  type_mismatch_arg_func(
    arg_pos: number,
    func_name: string,
    bad_type: SymbolType,
    correct_type: SymbolType
  ): void {
    const f_incld = iden_qute(func_name)
    const bt = type_qute(type_str(bad_type))
    const ct = type_qute(type_str(correct_type))
    this.semantic_err(
      `mismatch type arg(${arg_pos}) of ${f_incld} is not ${bt} must be ${ct}`
    )
  }
  arg_empty_call(pos: number): void {
    this.syntax_err(`empty at position ${pos} of arg call function`)
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
    const iden = iden_qute(typeof tok === 'string' ? tok : tok.val!)
    const arr_type = type_qute('Array')
    this.log_with_line(`The identifier ${iden} should be in type ${arr_type}`)
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
      `index of Array ${iden_qute(
        tok
      )} should be in type Int can not ${type_qute(type)}`
    )
  }
  arg_defined_last(key: any, index: any, type: any): void {
    this.syntax_err(
      `arg ${iden_qute(key)} defined at ${index} postion by type ${type_qute(
        type
      )}`
    )
  }
  type_ret_err(): void {
    return this.syntax_err('reutrn type must one of (Array,Int,Nil) type')
  }
  keyword_block_body(keyword: string, open: boolean = true): void {
    this.syntax_err(
      `body of ${keyword} be ${open ? 'started' : 'ended'} with ${
        open ? kword_qute(':') : kword_qute('end')
      } token`
    )
  }
  illegal_error(message: string): void {
    this.syntax_err(`illegal ${message}`)
  }
  illegal_keyword(keyword: string): void {
    this.illegal_error(`illegal keyword  token ${kword_qute(keyword)} in place`)
  }
  capsolate_syntax_err(tok: string, open: boolean): void {
    this.syntax_err(
      `you shude be ${
        open ? 'open' : 'close'
      } the capsolate expersion with ${kword_qute(tok)}`
    )
  }
  block_opcl_err(open: boolean = true, token: string): void {
    this.syntax_err(
      `you need to ${open ? 'open' : 'close'} block near token ${iden_qute(
        token
      )} with ${open ? kword_qute(':') : kword_qute('end')}`
    )
  }
  type_invalid_err(token: IToken): void {
    this.syntax_err(`invalid type ${token} valid type is (Array,Nil,Int)`)
  }
  correct_word_place(token: IToken, word: string): void {
    return this.syntax_err(
      `near token ${iden_qute(token.val!)} mus be '${kword_qute(word)}'`
    )
  }
  is_decleared(token: string): void {
    this.syntax_err(`identifier ${iden_qute(token)} is decleard.`)
  }
  syntax_err(message: string, pos?: IPosition): void {
    this.title_log(3, ':: syntax error ::', colors.cyan)
    this.log_with_line(message, pos)
  }
  semantic_err(message: string, pos?: IPosition): void {
    this.title_log(3, ':: semantic error ::', colors.red)
    this.log_with_line(message, pos)
  }
  warining(message: string, pos?: IPosition): void {
    this.title_log(3, ':: warning ::', colors.yellow)
    this.log_with_line(message, pos)
  }

  private title_log(h: number = 10, str: string = '', color?: any) {
    //create h tag
    while (h-- > 0) str = colors.bold(str)
    //
    console.log(color ? color(str) : str)
  }
  warn_with_pos(pos: IPosition, message: string) {
    this.warining(message, pos)
  }
  exit_log(message: string): -1 {
    console.log(message)
    return -1
  }
  exit_logline(message: string): -1 {
    return -1
  }

  log(message: string): void {
    console.log(message)
  }

  log_with_line(message: string, _pos?: IPosition): void {
    const pos = _pos ?? this.lexer.pos
    const lprn = colors.magenta('(')
    const rprn = colors.magenta(')')
    const path = colors.green(`${this.config.path}`)
    const row = colors.yellow(`${pos.row}`)
    const col = colors.cyan(`${pos.col}`)
    const str = `${lprn}${path}:${row}:${col}${rprn}`
    console.log(message, `at ${colors.bold(str)}`)
  }

  expected_arg(iden: string, expects: number, given: number): void {
    this.log_with_line(
      `function ${iden_qute(iden)} expects ${num_qute(
        expects
      )} arguments but only ${num_qute(given)} given!`
    )
  }

  not_defind(iden: string): void {
    this.syntax_err(`identifier ${iden_qute(iden)} is not defined!`)
  }

  wrong_type_arg(iden: string, arg_index: number): void {
    this.log_with_line(
      `wrong type for argument ${num_qute(arg_index)} of ${iden_qute(iden)}!`
    )
  }

  wrong_type_return(iden: string): void {
    this.log_with_line(
      `returning a value with wrong type from ${iden_qute(iden)}!`
    )
  }
}
