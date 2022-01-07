import { Token } from '../token'
import { keywords, sym, typedef } from '../constants'
import { Sym, SymbolTable } from '../symbol'
import {
  ILogger,
  ISymbol,
  ISymbolTable,
  IToken,
  KeySymbol,
  Nullable,
  SymbolType
} from '../types'
import { ILexer } from '../types/lexer'
import { LexicalError } from '../error'
import { is_null, tokChecker } from '../utils'
import { IErrorCorrection } from '../types/error-correction'
import { ErrorCorrection } from '../error-correction'
import { is_iden, is_num, is_type } from '../utils/token-cheker'
import { IFocusList } from '../types/focus'
import { FocusList } from '../focus'
import { ISuggestion } from '../suggestion'
import { IConfig } from '../config'
import { IGraphNode } from '../lib/graph'
import { IModule } from '../graph-module'
import { IParserBase, SubParser, SubParserTT } from './types'

export class Parser implements IParserBase {
  symtbl: ISymbolTable
  focuses: IFocusList
  crntstbl: ISymbolTable
  func_arg: ISymbolTable
  can_run: boolean
  log_lex: boolean
  module_node?: IGraphNode<IModule>
  imports: string[]
  error: boolean
  parser: Nullable<SubParser>
  constructor(
    public lexer: ILexer,
    public config: IConfig,
    public logger: ILogger,
    public suggest: ISuggestion,
    public ec: IErrorCorrection,
    root: ISymbolTable,
    is_lexlog?: boolean
  ) {
    this.func_arg = new SymbolTable()
    this.focuses = new FocusList()
    this.symtbl = root
    this.crntstbl = root
    this.can_run = false
    this.log_lex = false
    this.error = false
    this.imports = []
    if (is_lexlog) this.loging_lexer()
  }
  get imp_cholds_mod() {
    return this.module_node?.children! || []
  }
  get modules() {
    return this.module_node?.value!
  }
  private get mod_tbls() {
    return (
      this.imp_cholds_mod //
        .filter((cmn) => cmn.key != this.module_node?.key) //
        .map((mn) => mn.value.symbols) || //
      []
    )
  }
  execute(__SP__?: Nullable<SubParser>): void {
    if (is_null(__SP__)) return

    try {
      __SP__?.parse()
    } catch (err) {
      console.log(err)
      // console.log('err catch parseer')
    }
  }

  sym_declared(key: KeySymbol): ISymbol[] {
    const strk = key as string
    const syms: ISymbol[] = []
    let sym = this.crntstbl.find_globaly(strk)
    //exsit in scop
    if (sym) return [sym]

    for (const tbl of this.mod_tbls) {
      sym = tbl.get(key as string)
      //if exsit in module
      if (sym && sym.is_pub) syms.push(sym)
    }
    return syms
  }
  is_declared(key: KeySymbol): boolean {
    const strk = key as string
    const ex = (stbl: ISymbolTable) => stbl.exist(strk)
    const is_ex = !!this.crntstbl.find_globaly(strk)

    return is_ex || this.mod_tbls.some(ex)
  }
  set_symbols(symbols: ISymbolTable): void {
    this.crntstbl = this.symtbl = symbols
  }
  set_module_node(node: IGraphNode<IModule>): void {
    //update last position completed
    node.value.update_plex()
    //clear lexer data
    this.lexer.clear()
    this.lexer.set_fd(node.value.plex)
    this.logger.set_module(node.value)
    this.logger.reset()
    this.set_symbols(node.value.symbols)
    //
    this.module_node = node
  }
  unset_module_node(): void {
    const modl = this.module_node!.value
    modl.set_plex(modl.plex.fd, this.lexer.char_index)
    this.module_node = undefined
  }
  get root(): ISymbolTable {
    return this.symtbl
  }
  get current_symbols() {
    return this.crntstbl.symbols
  }
  token_skipper(cb: () => boolean): void {
    while (!cb()) this.next()
  }
  loging_lexer() {
    this.log_lex = true
  }
  next(ignored_exp: boolean = false): IToken {
    const tok = this.lexer.next_token()
    if (tok instanceof Token) {
      //log token
      if (this.log_lex) console.log(tok.val)
      //exit app
      if (tokChecker.is_eof(tok)) throw tok

      return tok
    }
    throw tok
  }
  get first_follow(): IToken {
    return this.follow(1)[0]
  }
  follow(size: number): IToken[] {
    const res = this.lexer.follow(size) || []

    for (let r of res)
      if (r instanceof LexicalError) {
        throw new Error(r.message)
      }
    return res as IToken[]
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
    //
    if (show_err) this.logger.capsolate_syntax_err(exp, open)

    return strict
  }
  capsolate = (
    left: string,
    right: string,
    callback: () => any,
    strict: boolean = true,
    show_err?: boolean
  ): boolean => {
    const cb = callback.bind(this.parser)
    //left open capsolate
    if (this.side_capsolate(left, strict, true, show_err)) return false
    //center state run
    if (cb() == false && strict) return false
    //right close capsolate
    if (this.side_capsolate(right, strict, false, show_err)) return false
    //
    return true
  }
  forward_chek(...items: string[]): boolean {
    const flw = this.follow(items.length)

    for (let i = 0; flw && i < flw.length; i++) {
      if (flw[i].val === items[i]) continue

      return false
    }
    return true
  }
  in_follow(...terminals: string[]): boolean {
    const flw = this.first_follow

    for (let i = 0; flw && i < terminals.length; i++) {
      if (flw.val == terminals[i]) return true
    }

    return false
  }
  is_NITK = (tok: IToken) => is_iden(tok) || is_type(tok) || is_num(tok)

  get fcs() {
    return this.focuses.focus!
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
  exsit_in(item: any, ...arr: any[]): boolean {
    return arr.findIndex((a) => a == item) != -1
  }
}
