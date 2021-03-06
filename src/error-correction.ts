import { ILogger, ISymbol, IToken, SymbolType } from './types'
import { ChekTokFunc, IErrorCorrection } from './types/error-correction'
import { EpxrType } from './types/parser'
import { tokChecker, typeCheking } from './utils'
import { keywords, sym } from './constants'
import {
  is_iden,
  is_num,
  is_return,
  is_returns,
  is_sem,
  is_spec,
  is_type,
  type_iden
} from './utils/token-cheker'
import { same_type } from './utils/type-checking'
import { Parser } from './parser/parser'
import { ExprCV, TesParser } from './parser/tes-parser'
import { Compiler } from './compiler'

export class ErrorCorrection implements IErrorCorrection {
  constructor(public compiler: Compiler, public logger: ILogger) {
  }
  get parser():Parser{
    return this.compiler.parser as Parser
  }
  ignored(cb: () => boolean): void {
    while (cb()) this.parser.next()
  }
  val_ignored_type_iden(): void {
    this.ignored(() => type_iden(this.parser.first_follow))
  }
  val_ignored_type_after_type(): void {
    this.ignored(() => is_type(this.parser.first_follow))
  }
  val_4step_can_defined(): boolean {
    const [first, follow, sem] = this.parser.follow(2)
    if (!first || !follow) {
      return false
    }
    // type iden | type type
    if (is_type(first) && type_iden(follow)) {
      return true
    }
    // iden type ; | iden iden ;
    // need semicolon becuse iden can expr
    if (
      sem && //
      is_iden(first) && //
      (type_iden(follow) || is_num(follow)) && //
      is_sem(sem)
    ) {
      return true
    }

    return false
  }

  expr_array_end_bracket(symnode: ISymbol): void {
    if (this.parser.in_follow(']')) {
      this.parser.next()
    } else {
      const msg = `expected  ] for identifier ${symnode.key}`
      this.logger.log_with_line(msg)
    }
  }
  expr_array_start_bracket(symbol: ISymbol, type: SymbolType): boolean {
    
    if (!(this.parser.in_follow('[') && !same_type(type, sym.ARRAY))) 
      return true
    
    if(this.parser.modules.is_parse)
      this.logger.identifier_not_array(symbol.key!.toString())

    return true
  }
  expr_array_index_type(symnode: ISymbol, type: SymbolType): void {
    const val = symnode && typeof symnode.key === 'string' ? symnode.key : ''
    const typstr = this.parser.type_str(type)
    //expr should be INT
    if (!same_type(type, sym.INT)) {
      this.logger.type_of_array_index(val, typstr)
    }
  }
  expr_func_definition(): void {
    throw new Error('Method not implemented.')
  }
  flist_before_type(arg_pos: number): number {
    const tok = this.parser.first_follow
    //,a
    if (this.parser.in_follow(',')) {
      return 1
      // [false,1 + this.parser.flist(size + 1)]
    }
    //a,a returns || a,a) a,a):
    //returns after or bad return letter
    else if (is_spec(tok) || is_returns(tok) || is_return(tok)) {
      return 0
    }

    return -1
  }
  flist_after_not_type(arg_pos: number): boolean {
    this.logger.syntax_err(`expected type of arg${arg_pos}`)

    if (is_type(this.parser.first_follow)) {
      return true
    }
    this.first_follow_spec(this.parser.is_NITK, this.parser.is_NITK)

    return false
  }

  first_follow_spec(check_first: ChekTokFunc, check_follow: ChekTokFunc): void {
    const [first, follow] = this.parser.follow(2)

    //fist
    if (check_first(first)) {
      //first follow* spec
      if (check_follow(follow)) {
        this.parser.next()
      }
    }
  }

  befor_function() {
    let tok = this.parser.first_follow
    if (tokChecker.is_func(tok)) return
  }
  after_end_function() {
    //skeep to find function
    const go_next = () => {
      return this.parser.follow(1)[0]
    }
    let next = go_next()

    while (
      !!(next = go_next()) && //
      (tokChecker.is_end(next) || tokChecker.is_spec(next)) //
    )
      this.parser.next()
  }
  /* Foreach Statment */
  foreach_of_first_at() {
    this.logger.syntax_err('before of need to identifier')
    while (this.parser.in_follow(keywords.OF)) this.parser.next()

    this.foreach_after_of()
  }
  foreach_after_iden(tok: IToken) {
    //skep of token
    let keytok: IToken
    const keyword_in_follow = () => {
      keytok = this.parser.follow(1)[0]
      return tokChecker.is_keyword(keytok)
    }

    if (tokChecker.is_of(tok)) this.parser.next()
    else {
      while (keyword_in_follow()) {
        this.logger.illegal_error(keytok!.val!)
        this.parser.next()
      }
    }
    this.foreach_after_of()
  }
  foreach_after_of() {
    const exp = new TesParser(this.compiler).expr()
    this.foreach_after_expr(exp.type)
  }
  foreach_in_expr_type(exist: EpxrType): void {
    if (typeCheking.is_empty(exist)) {
      this.logger.syntax_err('pleas add expersion after of keyword.')
    }
  }
  foreach_after_expr(exist: EpxrType) {
    if (typeCheking.is_empty(exist)) {
      this.logger.syntax_err('expersion in foreach destructing (iden of expr)')
    }
    const fw = () => this.parser.first_follow

    let tok

    while ((tok = fw()) && !this.parser.exsit_in(tok, ')', ':')) {
      this.parser.next()
    }
  }
  function_start() {
    const tok = this.parser.first_follow
    //init :: befor letter function
    if (!tokChecker.is_func(tok)) {
      this.logger.correct_word_place(tok, keywords.FUNCTION)

      this.parser.ec.first_follow_spec(is_iden, is_iden)
    } else {
      this.parser.next()
    }
  }
  function_in_iden(): string | null {
    const tok = this.parser.first_follow

    if (tokChecker.is_iden(tok)) {
      this.parser.next()
      return tok.val!
    }
    //
    if (tok && tok.val) this.logger.word_not_iden(tok.val)
    //
    if (tokChecker.is_keyword(tok)) this.parser.next()

    return null
  }
  function_skeep_tokn_not_valid() {
    //skip all iden after first iden after iden
    while (this.parser.in_follow(',', ':', '(', ')') === false)
      this.parser.next()
  }
  function_in_return() {
    const tok = this.parser.first_follow
    if (!tokChecker.is_returns(tok)) {
      this.logger.correct_word_place(tok, 'returns')

      const flw_ch = (t: IToken) => is_type(t) || is_iden(t)

      this.parser.ec.first_follow_spec(is_iden, flw_ch)
    } else {
      this.parser.next()
    }
  }
  function_return_type(): SymbolType {
    const tok = this.parser.first_follow
    if (is_type(tok) === false) {
      this.logger.type_ret_err()
      if (is_iden(tok)) {
        this.parser.next()
      }

      return sym.EMPTY
    }
    const tprs = new TesParser(this.compiler)

    return tprs.type() as SymbolType
  }
  private caps_clist(exist: boolean, prmc: number, val: string,regs:ExprCV[]) {
    const c = new TesParser(this.compiler).clist(0,regs)
    const isparse = this.parser.module_node?.value.is_parse
    //
    if (!isparse || !exist || c === prmc) return
    //
    this.parser.logger.expected_arg(val,  c,prmc)
  }
  expr_iden_is_func(iden: ISymbol, exist: boolean): ExprCV[] {
    const regs : ExprCV[] = [];
    const val = `${iden.key}`
    const prmc = exist === false ? 0 : iden.param_counts

    const center = () => this.caps_clist(exist, prmc, val,regs)

    this.parser.capsolate('(', ')',center, false)

    return regs
  }
  forget_sem():void{
    //ignored semicolon
    //if semicolon not defind it doesnt matter
    if (this.parser.in_follow(';')) this.parser.next()
    else this.parser.logger.expect_sem_error()
  }
  /* Body Begin or not with token ':'*/
  body_begin(scop: number, keyword: string): void {
    const tsprs = new TesParser(this.compiler)
    const signle = !this.parser.in_follow(':')
    tsprs.new_scop_stmt(scop, keyword,signle)
  }
}
