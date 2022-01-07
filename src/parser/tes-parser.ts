import { keywords, sym, typedef } from '../constants'
import { Sym } from '../symbol'
import { ISymbol, IToken, KeySymbol, Nullable, SymbolType } from '../types'
import { EpxrType } from '../types/parser'
import { tokChecker, typeCheking, zero } from '../utils'
import {
  is_alpha,
  is_eof,
  is_iden,
  is_num,
  is_pub,
  is_type,
  is_val
} from '../utils/token-cheker'
import { is_empty, same_type, type_str } from '../utils/type-checking'
import { IParser, IParserRD, SubParser } from './types'
import { IModule } from '../graph-module'
import { Compiler } from '../compiler'

export class TesParser extends SubParser implements IParser, IParserRD {
  module: IModule
  constructor(public cmp: Compiler) {
    super(cmp)
    this.module = this.parser.module_node!.value!
  }
  parse(): void {
    this.prog()
    
  }
  prog(): void {
    //
    if (this.parser.lexer.finished) return
    //init function
    this.func()
    //re call prog
    this.prog()
  }

  func(): void {
    let fcname
    let prmc = -1
    let type = sym.EMPTY
    let pub = false
    //after function
    let tok = this.parser.first_follow

    if (!tok || is_eof(tok)) return

    if (is_pub(tok)) {
      pub = true
      this.parser.next()
    }
    //starter function
    this.parser.ec.function_start()
    //get name of function
    fcname = this.parser.ec.function_in_iden()!
    //create function symbol node
    let symnode: Nullable<ISymbol> = null

    if (this.module.is_pre) {
      symnode = new Sym(fcname)
      symnode.init_subtable(this.parser.crntstbl)
    }
    //public function
    if (pub) symnode?.to_pub()
    //if position can set pos
    if (tok) symnode?.set_pos(tok.pos!)
    //check exsit in symbol table and show semantic error
    if (
      this.module.is_pre && //
      this.parser.crntstbl.exist(fcname) //
    ) {
      this.parser.logger.is_decleared(fcname)
    }
    //skeeping
    this.parser.ec.function_skeep_tokn_not_valid()
    //add defined to foucuses table
    //counting function arg
    this.parser.capsolate('(', ')', () => (prmc = this.flist()), false)
    //pop function defined in focuses table
    //set count of params function
    symnode?.set_prms_count(prmc)
    //returns place
    this.parser.ec.function_in_return()
    /* Return Typeing */
    type = this.parser.ec.function_return_type()
    symnode?.set_type(type as SymbolType)
    if (symnode) this.parser.crntstbl.add_node(symnode)
    //start scop function
    
    if(!symnode) 
      symnode = this.parser.crntstbl.get(fcname);
  
    this.parser.focuses.defind(symnode)
    this.parser.ec.body_begin(0, keywords.FUNCTION)
    this.parser.focuses.pop()

  }
  func_scop = (scop_key: any) => {
    return scop_key === keywords.FUNCTION && this.parser.crntstbl.last!
  }
  out_scop = () => {
    const parent = this.parser.crntstbl.parrent!
    if(parent)
    this.parser.crntstbl = parent
  }
  goto_scop = (scop_key: string | number) => {
      //get scop node
      let  symscop: ISymbol = new Sym(scop_key, sym.NIL);
      const fcs= this.parser.focuses.focus;

      if(fcs?.is_defined && scop_key === keywords.FUNCTION)
        symscop = fcs?.sym!; 
      //if scop not a function must init subtable to use new scop
      if (!symscop.is_func) symscop.init_subtable(this.parser.crntstbl)
      //
      this.parser.crntstbl = symscop.subTables!

      //function in pre parsing
      if(this.module.is_pre && scop_key !== keywords.FUNCTION)
        return
      //foreach statment
      if(this.module.is_parse && scop_key === keywords.FUNCTION)
        return
      //join arg of eny things to first table for function , foreach or ...
      this.parser.crntstbl.join(this.parser.func_arg)
      //clear func_arg to
      this.parser.func_arg.clear()
  }
  body(scop: number = 0, skop_key?: string): boolean {
    //goto sub scop
    this.goto_scop(skop_key || scop)

    while(this.stmt(scop, skop_key)) 

    this.out_scop()
    return false
  }
  stmt(scop: number = 0, scop_key?: string): boolean | any {
    let [tok] = this.parser.follow(1)
    //if
    if (tokChecker.is_if(tok)) this.if_stmt(scop)
    //while
    else if (tokChecker.is_while(tok)) this.while_stmt(scop)
    //foreach
    else if (tokChecker.is_foreach(tok)) this.foreach_stmt(scop)
    //return
    else if (tokChecker.is_return(tok)) this.return_stmt()
    //new scop block
    else if (tokChecker.is_begin(tok)) this.new_scop_stmt(scop, scop_key)
    //defenition var
    else if (tokChecker.is_val(tok)) {
      this.defvar()
      //ignored semicolon
      //if semicolon not defind it doesnt matter
      if (this.parser.in_follow(';')) this.parser.next()
      else this.parser.logger.expect_sem_error()
    }
    //expr
    else if (!typeCheking.is_empty(this.expr())) {
      //if semicolon not defind it doesnt matter
      if (this.parser.in_follow(';')) this.parser.next()
      else this.parser.logger.expect_sem_error()
    }
    //statment not definded
    else return false
    //statment defined
    return true
  }
  return_stmt() {
    this.parser.next()
    const t = this.expr()
    const func = this.parser.crntstbl.last;
    if(func?.type != t)
    {
      const fn =func?.key;
      const ft =type_str(func?.type);
      const rt =type_str(t);

      this.parser.logger.semantic_err(`return type of function '${fn}' is '${ft}' not '${rt}'`);
    }
    if (this.parser.in_follow(';')) this.parser.next()
    //if next token is not semicolon solved error during
  }
  if_stmt(scop: number) {
    this.parser.next()

    this.parser.capsolate('(', ')',()=> this.expr(), false)

    this.parser.ec.body_begin(scop, keywords.IF)

    if (this.parser.in_follow(keywords.ELSE)) {
      this.parser.next()
      this.parser.ec.body_begin(scop, keywords.ELSE)
    }
  }
  new_scop_stmt(scop: number, scop_key?: string) {
    //skiped ':' token
    if (this.parser.in_follow(':')) this.parser.next()
    //parsing body statment
    this.body(scop + 1, scop_key)
    //rm 'end'
    if (this.parser.in_follow(keywords.END)) {
      this.parser.next()
      //declared varaible or function but not used
      if (this.module.is_parse)
      {
        const varsym = this.parser.crntstbl.symbols.filter(s=>!s.is_func);
        this.parser.suggest.declared_and_not_used(varsym)
      }
    }
    //error nested
    else {
      const msg = scop_key ? scop_key : `'neseted blcok level ${scop}'`
      this.parser.logger.keyword_block_body(msg, false)
    }
  }
  while_stmt(scop: number) {
    this.parser.next()

    this.parser.capsolate('(', ')',()=> this.expr(), false)

    if (this.parser.in_follow(keywords.DO)) {
      this.parser.next()
      this.parser.ec.body_begin(scop, keywords.WHILE)
    }
  }
  foreach_stmt(scop: number) {
    //foreach keyword ignored
    this.parser.next()
    
    this.parser.capsolate('(', ')',()=> this.iden_of_expr(), false)
    
    const arg0 = zero(this.parser.func_arg.len)
    ? new Sym(undefined, 0)
    : this.parser.func_arg.symbols[0]
    
    arg0.set_index(0)
    
    this.parser.ec.body_begin(scop, keywords.FOREACH)
    //pop iden of expr definition varable
    if (this.parser.focuses.focus?.is_foreach) {
      this.parser.focuses.pop()
    }
  }
  iden_of_expr() {
    const tok = this.parser.first_follow
    //error hndleing

    if (tokChecker.is_keyword(tok)) {
      //error first at keyword of
      this.parser.logger.illegal_keyword(tok.val!)
      this.parser.ec.foreach_of_first_at()
    } else if (tokChecker.is_iden(tok)) {
      //skip identifier
      this.parser.next()
      if(this.module.is_parse)
      {
        const symbol = this.parser.func_arg.put(tok.val!, sym.INT)!
        this.parser.focuses.foreach(symbol)
        symbol.set_pos(tok.pos!)
      }

      if (this.parser.in_follow(keywords.OF)) {
        this.parser.next()
        this.parser.ec.foreach_in_expr_type(this.expr())
        //accepted
      } else {
        this.parser.logger.syntax_err("foreach need 'of' keyword after the identifier")
        this.parser.ec.foreach_after_of()
      }
    } else {
      if (tokChecker.is_num(tok)) {
        this.parser.logger.syntax_err('illegal number token to exprtion of foreach')
        this.parser.next()
      }
      this.parser.ec.foreach_after_iden(tok)
    }

    return true
  }

  defvar(): boolean {
    let name = undefined
    let type: SymbolType = sym.EMPTY
    let vled = is_val(this.parser.first_follow)
    if (vled) this.parser.next()
    //if can declear variable without 'val'
    else if (!this.parser.ec.val_4step_can_defined()) {
      return false
    }

    const [first, follow] = this.parser.follow(2)

    if (first == null) return true

    if (is_type(first)) {
      type = this.type() as SymbolType
      if (is_iden(follow)) {
        name = follow.val!
        this.parser.next()
      } else {
        //if start defvar not with val -> type any
        this.parser.suggest.first_must_after_follow(
          follow,
          'identifier',
          'type'
        )

        if (vled === false && (is_type(follow) || is_num(follow))) {
          name = follow.val!
          this.parser.next()
        }
      }
    } else if (is_iden(first)) {
      //error syntax first must be a type
      this.parser.logger.type_invalid_err(this.parser.next())
      //iden type reversed
      if (is_type(follow)) {
        this.parser.suggest.first_must_after_follow(
          follow,
          'identifier',
          'type'
        )
        name = first.val!
        type = follow.type as SymbolType
      } else if (
        is_iden(follow) || //
        (is_alpha(first) && is_num(follow))
      )
        //in alphabet num; iden ordered to identifier
        name = follow.val
      //in iden num; iden ordered to identifier
      else name = first.val

      if (name) this.parser.next()
    }
    //
    if(this.module.is_parse)
    {
      if (this.parser.crntstbl.exist(name!)) 
        this.parser.logger.is_decleared(name!)
      else 
        this.parser.crntstbl.put(name!, type, false)
      
    }

    return true
  }
  expr(): EpxrType {
    const flw = this.parser.first_follow
    if (
      tokChecker.is_iden(flw) ||
      tokChecker.is_num(flw) ||
      this.parser.in_follow('!', '+', '-', '(')
    ) {
      return this.conditionl_expr()
    }
    return sym.EMPTY
  }
  conditionl_expr(): EpxrType
  {
    const type = this.assign_expr()
    if(this.parser.in_follow("?"))
    {
      this.parser.next();

      let err: boolean = false
      const ltype = this.expr();
      if(is_empty(ltype)){
        err=true
        this.parser.logger.syntax_err("expersion prev : can not be empty");
      }
        
      if(this.parser.in_follow(":"))
        this.parser.next();
      else
        this.parser.logger.syntax_err("expected : after experison in conditional experssion");
      
      const rtype = this.expr();

      if(is_empty(rtype))
      {
        err=true
        this.parser.logger.syntax_err("expersion after : can not be empty");
      }
      if(!err && ltype != rtype)
      {
        if(this.module.is_parse)
          this.parser.logger.mismatch_type_conditional(ltype,rtype);
        err = true;
      }
      return err ? sym.NIL : ltype

    }
    return type
  }
  assign_expr(): EpxrType {
    const type = this.cond_expr()
    let type2: EpxrType
    let err: boolean = false

    if (this.parser.in_follow('=')) {
      while (this.parser.in_follow('=')) {
        this.parser.next()
        type2 = this.cond_expr()
        if (type != type2) {
          err = true
          this.parser.logger.syntax_err('illegal assignment!')
        }
      }
    }

    return err ? sym.NIL : type
  }

  cond_expr(): EpxrType {
    const type: EpxrType = this.or_expr()
    // let type2: EpxrType
    // let err: boolean = false
    // while(this.parser.in_follow('?')){

    // }
    return type
  }

  or_expr(): EpxrType {
    const type: EpxrType = this.and_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.parser.in_follow('||')) {
      this.parser.next()
      type2 = this.and_expr()
      if (type != type2) {
        err = true
        this.parser.logger.syntax_err('illegal or expression !')
      }
    }
    return err ? sym.NIL : type
  }

  and_expr(): EpxrType {
    const type = this.equ_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.parser.in_follow('&&')) {
      this.parser.next()
      type2 = this.equ_expr()
      if (type != type2) {
        err = true
        this.parser.logger.syntax_err('illegal and expression !')
      }
    }
    return err ? sym.NIL : type
  }

  equ_expr(): EpxrType {
    const type: EpxrType = this.relational_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.parser.in_follow('==', '!=')) {
      this.parser.next()
      type2 = this.relational_expr()
      if (type != type2) {
        err = true
        this.parser.logger.syntax_err('illegal equality expression !')
      }
    }
    return err ? sym.NIL : type
  }

  relational_expr(): EpxrType {
    const type: EpxrType = this.add_expr()
    let type2: EpxrType
    let err: boolean = false
    while (this.parser.in_follow('>', '<', '>=', '<=')) {
      this.parser.next()
      type2 = this.add_expr()
      if (type != type2) {
        err = true
        this.parser.logger.syntax_err('illegal relational expression !')
      }
    }
    return err ? sym.NIL : type
  }
  add_expr(): EpxrType {
    let typ: EpxrType = this.mul_expr()
    let _in = false
    while (this.parser.in_follow('+', '-')) {
      if (typ != sym.INT)
        this.parser.logger.incompatible_oprands()
      this.parser.next()
      typ = this.mul_expr()
      _in = true
    }
    if (typ != sym.INT && _in)
      this.parser.logger.incompatible_oprands()
    return typ
  }

  mul_expr(): EpxrType {
    let typ: EpxrType = this.unary_expr()
    let _in = false
    while (this.parser.in_follow('*', '/', '%')) {
      if (typ != sym.INT)
      this.parser.logger.incompatible_oprands()
      this.parser.next()
      typ = this.unary_expr()
      _in = true
    }
    if (typ != sym.INT && _in)
    this.parser.logger.incompatible_oprands()
    return typ
  }
  unary_oprator(): boolean {
    if (this.parser.in_follow('+', '-', '!')) {
      this.parser.next()
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
    this.parser.ec.expr_array_index_type(symnode, type)
    // expr ]
    this.parser.ec.expr_array_end_bracket(symnode)

    return type
  }
  postfix_expr(): EpxrType {
    let typ: EpxrType = this.prim_expr()
    const fsym = this.parser.focuses.focus?.sym!
    let isArr = typ === sym.ARRAY 

    if(!isArr && fsym)
      this.parser.ec.expr_array_start_bracket(fsym, typ)
    //cleaner code arrow function
    const moved_type = () => (typ = this.index_arr_expr(fsym))
    //if array change status symbol to array
    while (this.parser.in_follow('[')) 
      this.parser.capsolate('[', ']', moved_type, false, false)
    //after array expr[expr ]
    if (isArr) this.parser.focuses.pop()

    return isArr ? sym.ARRAY : typ
  }
  prim_expr(): EpxrType {
    const tok = this.parser.first_follow
    if (tokChecker.is_iden(tok)) {
      this.parser.next()
      const val = tok.val!
      let toks = this.parser.sym_declared(val)
      const iden = toks[0]
      const exist = !!iden
      //if use the identifier symbol checked th is_used propery
      if (iden) iden.used()
      //error not defind variable and suggest word this place
      else if (this.module.is_parse) {
        this.parser.logger.not_defind(val)
      }
      
      if (iden) this.parser.focuses.call(iden)
      //if expr not founded in symbol table
      else this.parser.focuses.free(val)
      
      if (this.parser.in_follow('(')) {

        //blow code parsed ( flist ) grmaer
        this.parser.ec.expr_iden_is_func(
          this.parser.focuses.focus!.sym!,
          exist 
        )
      }

      return iden ? iden.type! : sym.NIL
    } //
    if (tokChecker.is_num(tok)) {
      this.parser.next()
      return sym.INT
    }
    //
    if (tok.val == '(') {
      let typ: EpxrType = sym.NIL

      this.parser.capsolate('(', ')', () => (typ = this.expr()))

      return typ
    }
    //todo something to check
    if (this.parser.in_follow(')', ']', ';', '}')) return sym.NIL

    if(this.module.is_pre)
      this.parser.logger.log_with_line('primary expression is not ok!')
    this.parser.next()
    return sym.NIL
  }

  flist(pos: number = 0,saved_arg:boolean=false): number {
    let arg_name: KeySymbol = undefined
    let arg_type: SymbolType = sym.EMPTY
    let tok = this.parser.first_follow
    //
    const status = this.parser.ec.flist_before_type(pos)
    //
    if (status === 1) 
      return 1 + this.flist(pos + 1)
    //
    else if (status === 0) return 0
    //lang type
    if (is_type(tok)) arg_type = this.type() as SymbolType
    //tok not type
    //follow of tok is type
    //mean :=> [tok not type] type :=> same ret,rturn
    else if (this.parser.ec.flist_after_not_type(pos)) 
      return 0
    //
    if (is_iden(this.parser.first_follow)) arg_name = this.iden().val!
    //
    else this.parser.logger.syntax_err(`expected name of arg${pos}`)

    if(this.module.is_pre || saved_arg) {
      const ex_arg = arg_name && this.parser.func_arg.get(arg_name)
      
      if(ex_arg){
        const type = this.parser.type_str(ex_arg.type)
        this.parser.logger.arg_defined_last(ex_arg.key, ex_arg.index, type)
      }
      
      const arg = new Sym(arg_name, arg_type)
      arg.set_index(pos)
      this.parser.func_arg.add_node(arg)
    }

    //skeep for counting
    if (this.parser.in_follow(',')) {
      this.parser.next()
    }
    return 1 + this.flist(pos + 1)
  }

  clist(pos: number = 0): number {
    const exp_tpye = this.expr()
    const empty = typeCheking.is_empty(exp_tpye)
    const snodefcs = this.parser.fcs
    if (empty) {
      this.parser.logger.arg_empty_call(pos)
    } else if (
      this.module.is_parse && //
      snodefcs && // can be null last fcouses
      snodefcs.is_call && //not free
      snodefcs.sym?.is_func && //is function not identifier
      snodefcs.sym?.param_counts > pos //position defined function must greater than eq pos
    ) {
      //get argument at position of symbols
      const arg_at_pos = snodefcs.sym?.subTables!.symbols[pos]
      //mismatch arg defined and arg call function
      if (!same_type(arg_at_pos.type!, exp_tpye)) {
        const ctyp = arg_at_pos.type!
        const btyp = exp_tpye
        const fname = snodefcs.sym?.key! as string
        this.parser.logger.type_mismatch_arg_func(pos, fname, btyp, ctyp)
      }
    }
    if (this.parser.in_follow(',')) {
      this.parser.next()
      return this.clist(pos + 1) + 1
    }
    //eny token not 'expr' and ','
    if (empty) return 0

    //(a,)*a
    return 1
  }
  type(ignored: boolean = false): SymbolType | IToken {
    const tok = ignored ? this.parser.follow(1)[0] : this.parser.next()

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
    return ignored ? this.parser.follow(1)[0] : this.parser.next()
  }
}
