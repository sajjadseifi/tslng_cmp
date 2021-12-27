import { Token } from '../token'
import { keywords, sym, typedef } from '../constants'
import { Sym, SymbolTable } from '../symbol'
import {
  ILogger,
  ISymbol,
  ISymbolTable,
  IToken,
  KeySymbol,
  SymbolType,
  SymNulable,
  TokenType
} from '../types'
import { ILexer } from '../types/lexer'
import { EpxrType, IParser, IParserRD } from '../types/parser'
import { LexicalError } from '../error'
import { Logger } from '../logger'
import { tokChecker, typeCheking } from '../utils'
import { IErrorCorrection } from '../types/error-correction'
import { ErrorCorrection } from './error-correction'
import { is_iden, is_num, is_type } from '../utils/token-cheker'
import { IFocusList } from '../types/focus'
import { FocusList } from '../focus'
import { ISuggestion, Suggestion } from '../suggestion'

export enum StatusIDEN {
  FREE,
  CALL,
  DEFIND,
  FOREACH
}

export class Parser implements IParserRD, IParser {
  symtbl: ISymbolTable
  ec: IErrorCorrection
  focuses: IFocusList
  private crntstbl: ISymbolTable
  private logger: ILogger
  private func_arg: ISymbolTable
  private suggest: ISuggestion
  constructor(public lexer: ILexer) {
    this.symtbl = new SymbolTable()
    this.init()
    this.crntstbl = this.symtbl
    this.logger = new Logger(lexer)
    this.func_arg = new SymbolTable()
    this.ec = new ErrorCorrection(this, this.logger)
    this.focuses = new FocusList()
    this.suggest = new Suggestion(this, this.logger)
  }
  get current_symbols() {
    return this.crntstbl.symbols
  }
  private init() {
    //built in functions
    this.symtbl.add_node(new Sym('getInt', sym.INT, 0))
    this.symtbl.add_node(new Sym('printInt', sym.NIL, 1))
    this.symtbl.add_node(new Sym('createArray', sym.ARRAY, 1))
    this.symtbl.add_node(new Sym('arrayLength', sym.INT, 1))
    this.symtbl.add_node(new Sym('exit', sym.NIL, 1))
  }
  log(message: string) {
    console.log(message)
  }
  next(): IToken {
    const tok = this.lexer.next_token()

    if (tok instanceof Token) {
      if (tokChecker.is_eof(tok)) {
        process.exit(0)
      }
      return tok
    }
    console.log(tok as LexicalError)
    return this.next()
  }
  get first_follow(): IToken {
    return this.follow(1)[0]
  }
  follow(size: number): IToken[] {
    const res = this.lexer.follow(size) || []
    //
    for (let r of res) if (r instanceof LexicalError) throw new Error(r.message)

    return res as IToken[]
  }
  private get cline() {
    return this.lexer.counter_line
  }

  out_scop = () => {
    this.crntstbl = this.crntstbl.parrent!
    this.crntstbl.del_node(this.crntstbl.last())
  }
  goto_scop = (symscop: Sym) => {
    symscop.init_subtable(this.crntstbl)
    this.crntstbl = symscop.subTables!
    this.crntstbl.join(this.func_arg)
    this.func_arg.clear()
  }
  new_scop = () => new Sym(undefined) as ISymbol
  run(): void {
    this.prog()
  }
  prog(): void {
    if (this.lexer.finished) return
    //init function
    this.func()
    //re call prog
    this.prog()
  }
  func(): boolean {
    let fcname
    let prmc = -1
    let type = sym.EMPTY

    this.crntstbl = this.symtbl
    this.ec.function_start()
    //after function
    fcname = this.ec.function_in_iden()!
    console.log()
    let symnode: ISymbol = new Sym(fcname)
    symnode.init_subtable(this.crntstbl)

    if (fcname && this.crntstbl.exist(fcname)) {
      this.logger.is_decleared(fcname)
      //change to scop if name same
      symnode.set_key(-1)
    }

    this.crntstbl.add_node(symnode)

    //skeeping
    this.ec.function_skeep_tokn_not_valid()
    //add defined to foucuses table
    this.focuses.defind(symnode)
    //counting function arg
    this.capsolate('(', ')', () => (prmc = this.flist()), false)
    //pop function defined in focuses table
    this.focuses.pop()
    //set count of params function
    symnode!.set_prms_count(prmc)

    //returns place
    this.ec.function_in_return()

    /* Return Typeing */
    type = this.ec.function_return_type()
    symnode!.set_type(type as SymbolType)

    this.ec.body_begin(0, keywords.FUNCTION)

    return true
  }
  body(scop: number = 0, skop_key?: string): boolean {
    let ended = false
    const symscop = new Sym(skop_key || scop, sym.NIL)
    //goto sub scop
    this.goto_scop(symscop)

    if (this.stmt(scop, skop_key)) {
      ended = this.body(scop, skop_key)
    }
    //declared varaible or function but not used
    this.suggest.declared_and_not_used()
    //outof scop
    this.out_scop()
    return ended
  }
  stmt(scop: number = 0, scop_key?: string): boolean | any {
    let [tok] = this.follow(1)
    //if
    if (tokChecker.is_if(tok)) this.if_stmt(scop)
    //while
    else if (tokChecker.is_while(tok)) this.while_stmt(scop)
    //foreach
    else if (tokChecker.is_foreach(tok)) this.for_stmt(scop)
    //return
    else if (tokChecker.is_return(tok)) this.return_stmt()
    //new scop block
    else if (tokChecker.is_begin(tok)) this.new_scop_stmt(scop, scop_key)
    //defenition var
    else if (tokChecker.is_val(tok)) {
      this.defvar()
      //ignored semicolon
      //if semicolon not defind it doesnt matter
      if (this.in_follow(';')) this.next()
    }
    //expr
    else if (!typeCheking.is_empty(this.expr())) {
      //if semicolon not defind it doesnt matter
      if (this.in_follow(';')) this.next()
    }
    //statment not definded
    else return false
    //statment defined
    return true
  }
  return_stmt() {
    this.next()
    this.expr()
    if (this.in_follow(';')) this.next()
    //if next token is not semicolon solved error during
  }
  if_stmt(scop: number) {
    this.next()

    this.capsolate('(', ')', this.expr, false)

    this.ec.body_begin(scop, keywords.IF)

    if (this.in_follow(keywords.ELSE)) {
      this.next()
      this.ec.body_begin(scop, keywords.ELSE)
    }
  }
  new_scop_stmt(scop: number, scop_key?: string) {
    //skiped ':' token
    if (this.in_follow(':')) this.next()
    //parsing body statment
    this.body(scop + 1, scop_key)
    //rm 'end'
    if (this.in_follow(keywords.END)) {
      this.next()
    }
    //error nested
    else {
      const msg = scop_key ? scop_key : `'neseted blcok level ${scop}'`
      this.logger.keyword_block_body(msg, false)
    }
  }
  while_stmt(scop: number) {
    this.next()

    this.capsolate('(', ')', this.expr, false)

    if (this.in_follow(keywords.DO)) {
      this.next()
      this.ec.body_begin(scop, keywords.WHILE)
    }
  }
  for_stmt(scop: number) {
    //foreach keyword ignored
    this.next()

    this.capsolate('(', ')', this.iden_of_expr, false)

    let arg0 = null
    if (this.func_arg.symbols.length === 0) arg0 = new Sym(undefined, 0)
    if (arg0 == null) arg0 = this.func_arg.symbols[0]

    arg0.set_index(0)

    this.ec.body_begin(scop, keywords.FOREACH)

    //pop iden of expr definition varable
    if (this.focuses.focus?.status === StatusIDEN.FOREACH) {
      this.focuses.pop()
    }
  }
  iden_of_expr() {
    const [tok] = this.follow(1)
    //error hndleing

    if (tokChecker.is_keyword(tok)) {
      //error first at keyword of
      this.logger.illegal_keyword(tok.val!)
      this.ec.foreach_of_first_at()
    } else if (tokChecker.is_iden(tok)) {
      //skip identifier
      this.next()

      const symbol = this.func_arg.put(tok.val!, sym.INT)!
      this.focuses.free(symbol.key)

      if (this.in_follow(keywords.OF)) {
        this.next()
        this.ec.foreach_in_expr_type(this.expr())
        //accepted
      } else {
        this.logger.syntax_err("foreach need 'of' keyword after the identifier")
        this.ec.foreach_after_of()
      }
    } else {
      if (tokChecker.is_num(tok)) {
        this.logger.syntax_err('illegal number token to exprtion of foreach')
        this.next()
      }
      this.ec.foreach_after_iden(tok)
    }
  }

  defvar(): boolean {
    if (this.in_follow(keywords.VAL) === false) return false

    this.next()

    const toktype = this.type()

    if (toktype instanceof Token) {
      this.log(
        ': syntax error missing type type of variable mu be (Array,Nil,Int)'
      )
      return false
    }
    const iden = this.iden()
    if (iden.type !== TokenType.TOKEN_IDENTIFIER) {
      this.log(
        `: syntax error during declear variable '${iden.val}' is not identifier.'`
      )
      return false
    }
    if (this.crntstbl.exist(iden.val!)) {
      this.log(`identifier ${iden.val} decleared at same in same scop!`)
    } else {
      this.crntstbl.put(iden.val!, toktype as SymbolType, false)
    }
    return true
  }
  side_capsolate(
    exp: string,
    strict: boolean,
    open: boolean,
    show_err?: boolean
  ) {
    if (this.in_follow(exp)) {
      this.next()
      return false
    }
    if (show_err) {
      this.logger.capsolate_syntax_err(exp, open)
    }

    return strict
  }
  capsolate = (
    left: string,
    right: string,
    callback: () => any,
    strict: boolean = true,
    show_err?: boolean
  ): boolean => {
    const cb = callback.bind(this)
    //left open capsolate
    if (this.side_capsolate(left, strict, true, show_err)) return false
    //center state run
    if (cb() == false && strict) return false
    //right close capsolate
    if (this.side_capsolate(right, strict, false, show_err)) return false
    //
    return true
  }
  exsit_in(item: any, ...arr: any[]): boolean {
    return arr.findIndex((a) => a == item) != -1
  }

  expr(): EpxrType {
    const flw = this.first_follow
    if (
      tokChecker.is_iden(flw) ||
      tokChecker.is_num(flw) ||
      this.in_follow('!', '+', '-', '(')
    ) {
      return this.assign_expr()
    }
    return sym.EMPTY
  }

  assign_expr(): EpxrType {
    const type = this.cond_expr()
    let type2: EpxrType
    let err: boolean = false

    if (this.in_follow('=')) {
      while (this.in_follow('=')) {
        this.next()
        type2 = this.cond_expr()
        if (type != type2) {
          err = true
          this.logger.syntax_err('illegal assignment!')
        }
      }
    }
    // else if (this.in_follow('?')) {
    //   this.next()
    //   const ltype = this.cond_expr()
    //   // const rexp = this.cond_expr()
    //   if (this.in_follow(':')) {
    //     this.next()
    //     const rtype = this.cond_expr()

    //   } else {
    //     this.logger.syntax_err('illegal condition!')
    //     err = true
    //   }
    // }
    return err ? sym.NIL : type
  }

  cond_expr(): EpxrType {
    const type: EpxrType = this.or_expr()
    // let type2: EpxrType
    // let err: boolean = false
    // while(this.in_follow('?')){

    // }
    return type
  }

  or_expr(): EpxrType {
    const type: EpxrType = this.and_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.in_follow('||')) {
      this.next()
      type2 = this.and_expr()
      if (type != type2) {
        err = true
        this.logger.syntax_err('illegal or expression !')
      }
    }
    return err ? sym.NIL : type
  }

  and_expr(): EpxrType {
    const type = this.equ_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.in_follow('&&')) {
      this.next()
      type2 = this.equ_expr()
      if (type != type2) {
        err = true
        this.logger.syntax_err('illegal and expression !')
      }
    }
    return err ? sym.NIL : type
  }

  equ_expr(): EpxrType {
    const type: EpxrType = this.relational_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.in_follow('==', '!=')) {
      this.next()
      type2 = this.relational_expr()
      if (type != type2) {
        err = true
        this.logger.syntax_err('illegal equality expression !')
      }
    }
    return err ? sym.NIL : type
  }

  relational_expr(): EpxrType {
    const type: EpxrType = this.add_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.in_follow('>', '<', '>=', '<=')) {
      this.next()
      type2 = this.add_expr()
      if (type != type2) {
        err = true
        this.logger.syntax_err('illegal relational expression !')
      }
    }
    return err ? sym.NIL : type
  }
  add_expr(): EpxrType {
    let typ: EpxrType = this.mul_expr()
    let _in = false
    while (this.in_follow('+', '-')) {
      if (typ != sym.INT) this.logger.log_with_line('incompatible operands!')
      this.next()
      typ = this.mul_expr()
      _in = true
    }
    if (typ != sym.INT && _in)
      this.logger.log_with_line('incompatible operands!')
    return typ
  }

  mul_expr(): EpxrType {
    let typ: EpxrType = this.unary_expr()
    let _in = false
    while (this.in_follow('*', '/', '%')) {
      if (typ != sym.INT) this.logger.log_with_line('incompatible operands!')
      this.next()
      typ = this.unary_expr()
      _in = true
    }
    if (typ != sym.INT && _in)
      this.logger.log_with_line('incompatible operands!')
    return typ
  }
  unary_oprator(): boolean {
    if (this.in_follow('+', '-', '!')) {
      this.next()
      return true
    }
    return false
  }
  unary_expr(): EpxrType {
    while (this.unary_oprator());
    return this.postfix_expr()
  }
  index_arr_expr(symnode: ISymbol): EpxrType {
    //[ expr
    const type = this.expr()
    //expr should be INT
    this.ec.expr_array_index_type(symnode, type)
    // expr ]
    this.ec.expr_array_end_bracket(symnode)

    return type
  }
  postfix_expr(): EpxrType {
    let typ: EpxrType = this.prim_expr()
    const fsym = this.focuses.focus?.sym!
    const isArr = this.ec.expr_array_start_bracket(fsym, typ)
    //cleaner code arrow function
    const moved_type = () => (typ = this.index_arr_expr(fsym))
    //if array change status symbol to array
    while (this.in_follow('[')) {
      this.capsolate('[', ']', moved_type, false, false)
    }
    //after array expr[expr ]
    if (isArr) this.focuses.pop()

    return isArr ? sym.INT : typ
  }
  prim_expr(): EpxrType {
    const tok = this.first_follow
    if (tokChecker.is_iden(tok)) {
      const val = tok.val!
      let iden = this.crntstbl.find_globaly(val)
      const exist = !!iden
      this.next()
      //if use the identifier symbol checked th is_used propery
      if (iden) iden.used()
      //error not defind variable and suggest word this place
      else this.logger.not_defind(val)

      if (this.in_follow('(')) {
        //add function or expr calling last table
        if (iden) this.focuses.call(iden)
        //if expr not founded in symbol table
        else this.focuses.free(val)
        //blow code parsed ( flist ) grmaer
        this.ec.expr_iden_is_func(iden!, exist)
        //out of function expresion
        this.focuses.pop()
      }

      return iden ? iden.type! : sym.NIL
    } //
    if (tokChecker.is_num(tok)) {
      this.next()
      return sym.INT
    }
    //
    if (tok.val == '(') {
      let typ: EpxrType = sym.NIL

      this.capsolate('(', ')', () => (typ = this.expr()))

      return typ
    }
    //todo something to check
    if (this.in_follow(')', ']', ';', '}')) return sym.NIL

    this.logger.log_with_line('primary expression is not ok!')
    this.next()
    return sym.NIL
  }
  forward_chek(...items: string[]): boolean {
    const flw = this.follow(items.length)

    for (let i = 0; i < flw.length; i++) {
      if (flw[i].val === items[i]) continue

      return false
    }
    return true
  }
  in_follow(...terminals: string[]): boolean {
    const [flw] = this.follow(1)

    for (let i = 0; i < terminals.length; i++) {
      if (flw.val == terminals[i]) return true
    }

    return false
  }
  is_NITK = (tok: IToken) => is_iden(tok) || is_type(tok) || is_num(tok)

  flist(pos: number = 0): number {
    let arg_name: KeySymbol = undefined
    let arg_type: SymbolType = sym.EMPTY
    let tok = this.first_follow

    const status = this.ec.flist_before_type(pos)

    if (status === 1) {
      return 1 + this.flist(pos)
    } else if (status === 0) {
      return 0
    }

    if (is_type(tok)) {
      //lang type
      arg_type = this.type() as SymbolType
    }
    //tok not type
    //follow of tok is type
    //mean :=> [tok not type] type :=> same ret,rturn
    else if (this.ec.flist_after_not_type(pos)) {
      return 0
    }

    if (is_iden(this.first_follow)) {
      //
      arg_name = this.iden().val!
    } else {
      //
      this.logger.syntax_err(`expected name of arg${pos}`)
    }

    const ex_arg = arg_name && this.func_arg.get(arg_name)

    if (ex_arg) {
      //
      const type = this.type_str(ex_arg.type)
      this.logger.arg_defined_last(ex_arg.key, ex_arg.index, type)
    } else {
      //
      const arg = new Sym(arg_name, arg_type)
      arg.set_index(pos)
      this.func_arg.add_node(arg)
    }
    //skeep for counting
    if (this.in_follow(',')) {
      this.next()
    }
    return 1 + this.flist(pos + 1)
  }
  clist(pos: number = 0): number {
    const empty = typeCheking.is_empty(this.expr())

    if (this.in_follow(',')) {
      this.next()
      return this.clist(pos + 1) + 1
    }
    //eny token not 'expr' and ','
    if (empty) {
      this.logger.syntax_err(`at position ${pos} of arg call function`)
      return 0
    }
    //(a,)*a
    return 1
  }

  type_str(type: SymbolType | any): string {
    switch (type) {
      case sym.NIL:
        return typedef.Nil
      case sym.INT:
        return typedef.Int
      case sym.ARRAY:
        return typedef.Array
    }

    return typedef.Empty
  }
  type(ignored: boolean = false): SymbolType | IToken {
    const tok = ignored ? this.follow(1)[0] : this.next()

    switch (tok.val) {
      case typedef.Array:
        return sym.ARRAY
      case typedef.Int:
        return sym.INT
      case typedef.Nil:
        return sym.NIL
      default:
        return tok
    }
  }
  num(): IToken {
    throw new Error('Method not implemented.')
  }
  iden(ignored: boolean = false): IToken {
    return ignored ? this.follow(1)[0] : this.next()
  }
}
