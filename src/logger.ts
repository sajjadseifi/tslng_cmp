import { IConfig } from './config'
import { keywords, strs } from './constants'
import {
  ILogger,
  IPosition,
  ISymbol,
  IToken,
  LogingAquiredStatus,
  Nullable,
  SymbolType
} from './types'
import { IFocuse } from './types/focus'
import { ILexer } from './types/lexer'
import { type_str } from './utils/type-checking'
import colors from 'colors/safe'
import { StatusIDEN } from './parser/types'
import { IModule } from './graph-module'
import { IPath, IPathTes } from './lib/path'
import { EpxrType } from './types/parser'

const includ_qute = (str: string = '', color: any) => {
  return `'${color(str)}'`
}
export const type_qute = (str: string) => includ_qute(str, colors.cyan)
export const iden_qute = (str: string) => includ_qute(str, colors.yellow)
export const kword_qute = (str: string) => includ_qute(str, colors.magenta)
export const num_qute = (num: any) => includ_qute(num, colors.yellow)

export enum LoggerStatus {
  RESET,
  ANY,
  ERROR,
  WARNINIG,
  SYNTAX,
  SEMANTIC
}
function get_ok_log(visiblity: Partial<LogingAquiredStatus>, prp_key: string) {
  switch (prp_key) {
    case 'syntax_err':
      return visiblity?.syntax!
    case 'semantic_err':
      return visiblity?.semantic!
    case 'warining':
      return visiblity?.warning
    case 'error':
      return visiblity?.error
  }
  return true
}
export class Logger implements ILogger {
  private status: LoggerStatus
  private visiblity!: Partial<LogingAquiredStatus>
  constructor(
    public lexer: ILexer,
    public config: IConfig,
    public path: IPathTes,
    public modl?: Nullable<IModule>
  ) {
    this.status = LoggerStatus.RESET
  }
  expect_sem_error(): void {
    this.syntax_err('expected ; after expersion')
  }
  set_loging_status(stts?: Partial<LogingAquiredStatus>): void {
    this.visiblity = stts!
  }
  reset(): void {
    this.status = LoggerStatus.RESET
  }
  set_module(modl: IModule): void {
    this.modl = modl
  }
  private title_with_status(
    title: string,
    status: LoggerStatus,
    color: any,
    message: string,
    pos?: IPosition
  ) {
    const t = `:: ${title} ::`
    const spase = this.space(t.length)
    if (this.status !== status) {
      this.title_log(3, t, color)
    }

    this.log_with_line(`${spase}${message}`, pos)
    this.status = status
  }
  syntax_err(message: string, pos?: IPosition, strict: boolean = false): void {
    if(!this.modl?.is_pre) return;
    //
    this.title_with_status(
      strs.syntax_error, 
      LoggerStatus.SYNTAX,
      colors.cyan,
      message,
      pos 
    )
  }
  semantic_err(
    message: string,
    pos?: IPosition,
    strict: boolean = false
  ): void {
    this.title_with_status(
      strs.semantic, //
      LoggerStatus.SEMANTIC, //
      colors.red, //
      message, //
      pos //
    )
  }
  warining(message: string, pos?: IPosition, strict: boolean = false): void {
    this.title_with_status(
      strs.warning, //
      LoggerStatus.WARNINIG, //
      colors.yellow, //
      message, //
      pos //
    )
  }
  error(message: string, pos?: IPosition, strict: boolean = false): void {
    this.title_with_status(
      strs.error, //
      LoggerStatus.ERROR, //
      colors.red, //
      message, //
      pos //
    )
  }
  word_not_iden(word: string): void {
    this.syntax_err(`name ${iden_qute(word)} dont identifier'`)
  }
  not_found_start_func(starter?: string): void {
    const str = starter ?? this.config.app.start
    const idc = iden_qute(str)
    this.semantic_err(`can not find ${idc} function to start program`)
  }
  mismatch_type_conditional(tpye1:EpxrType,tpye2:EpxrType):void
  {
    const t1c = type_qute(type_str(tpye1)) 
    const t2c = type_qute(type_str(tpye2)) 
    this.semantic_err(`mismatch type conditional expr,'${t1c}' not equal to '${t2c}' `);

  }
  type_mismatch_arg_func(
    arg_pos: number,
    func_name: string,
    bad_type: SymbolType,
    correct_type: SymbolType
  ): void {
    const fcc = iden_qute(func_name)
    const bt = type_qute(type_str(bad_type))
    const ct = type_qute(type_str(correct_type))
    const ap = num_qute(arg_pos)
    this.semantic_err(
      `mismatch type, arg ${ap} of ${fcc} not ${bt} must be ${ct}`
    )
  }
  arg_empty_call(pos: number): void {
    const posc = num_qute(pos)
    this.syntax_err(`empty at position ${posc} of arg call function`)
  }

  declared_and_not_used(symbl: ISymbol, focuse: IFocuse | null): void {
    let str
    //
    if (focuse && focuse.status === StatusIDEN.FOREACH)
      str = `${keywords.FOREACH} identifier`
    //
    else if (symbl.is_func) str = keywords.FUNCTION
    //
    else str = keywords.VAL
    //
    const idc = iden_qute(symbl.key as string)

    const msg = `${kword_qute(str)} ${idc} is declared but not used`
    //
    this.warining(msg, symbl.position)
  }
  identifier_not_array(tok: string | IToken): void {
    const iden = iden_qute(typeof tok === 'string' ? tok : tok.val!)
    const arr_type = type_qute('Array')
    this.semantic_err(`The identifier ${iden} should be in type ${arr_type}`);
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
    const idc = iden_qute(tok)
    const typc = type_qute(type)
    this.log_with_line(
      `index of Array ${idc} should be in type Int can not ${typc}`
    )
  }
  arg_defined_last(key: any, index: any, type: any): void {
    const idc = iden_qute(key)
    const typc = type_qute(type)
    const indc = num_qute(index)
    this.syntax_err(`arg ${idc} defined at ${indc} postion by type ${typc}`)
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
    const opc = open ? 'open' : 'close'
    const kto = kword_qute(tok)
    this.syntax_err(`you shude be ${opc} the capsolate expersion with ${kto}`)
  }
  block_opcl_err(open: boolean = true, token: string): void {
    const opc = open ? 'open' : 'close'
    const idq = iden_qute(token)
    const blk = open ? kword_qute(':') : kword_qute('end')

    this.syntax_err(`you need to ${opc} block near token ${idq} with ${blk}`)
  }
  type_invalid_err(token: IToken): void {
    const tc = type_qute(token.val!)
    this.syntax_err(`invalid type ${tc} valid type is (Array,Nil,Int)`)
  }
  correct_word_place(token: IToken, word: string): void {
    if (!token || !token.val) return

    const kc = kword_qute(word)
    const ic = iden_qute(token.val!)
    return this.syntax_err(`near token ${ic} mus be ${kc}`)
  }
  is_decleared(token: string): void {
    this.syntax_err(`identifier ${iden_qute(token)} is decleard.`)
  }
  private space = (counts: number) => [...Array(counts)].map(() => ' ').join('')

  not_found_module(module: string) {
    const lprn = colors.magenta('(')
    const rprn = colors.magenta(')')
    this.error(`can not find module ${lprn}${module}${rprn}`)
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
    if (!this.modl) return

    const pos = _pos ?? this.lexer?.pos
    const lprn = colors.magenta('(')
    const rprn = colors.magenta(')')
    let _pth = colors.green(this.path.path_to_str(this.modl.path))
    let str
    if (pos) {
      const row = colors.yellow(`${pos.row}`)
      const col = colors.cyan(`${pos.col}`)
      str = `${lprn}${_pth}:${row}:${col}${rprn}`
    } else {
      str = `${lprn}${_pth}${rprn}`
    }

    console.log(message, `at ${colors.bold(str)}`)
  }
  expected_arg(iden: string, expects: number, given: number): void {
    const idc = iden_qute(iden)
    const exc = num_qute(expects)
    const gvc = num_qute(given)
    const msg = `function ${idc} expects ${exc} arguments but only ${gvc} given!`
    this.semantic_err(msg)
  }
  not_defind(iden: string): void {
    this.semantic_err(`identifier ${iden_qute(iden)} is not defined!`)
  }
  wrong_type_arg(iden: string, arg_index: number): void {
    const argic = num_qute(arg_index)
    const idc = iden_qute(iden)
    this.log_with_line(`wrong type for argument ${argic} of ${idc}!`)
  }
  wrong_type_return(iden: string): void {
    const idc = iden_qute(iden)

    this.log_with_line(`returning a value with wrong type from ${idc}!`)
  }
  incompatible_oprands():void
  {
    if(this.modl?.is_parse)
      this.semantic_err('incompatible operands!')
  }
}
