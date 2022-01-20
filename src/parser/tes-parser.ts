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
import { IParser, IParserRD, StatusIDEN, SubParser } from './types'
import { IModule } from '../graph-module'
import { Compiler } from '../compiler'
import { TSIR } from '../ir/tes-IR'

export interface ConceptualValues<T,A>
{
  type:T,
  things:A
}
export interface ExprCV{
  is_num?:boolean
  val:any
}
export const cv=<T,A>(type:T,things:A):ConceptualValues<T,A>=>({type,things})

export class TesParser extends SubParser implements IParser, IParserRD {
  module: IModule
  ir:TSIR
  constructor(public cmp: Compiler) {
    super(cmp)
    this.module = this.parser.module_node!.value!

    this.ir = this.cmp.ir as TSIR
  }
  parse(): void {
    this.prog()
    
    if(this.is_prs) this.ir.wlbl(-1);
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
    //set count of params function
    symnode?.set_prms_count(prmc)
    //returns place
    this.parser.ec.function_in_return()
    
    /* Return Typeing */
    type = this.parser.ec.function_return_type()
    symnode?.set_type(type as SymbolType)
    
    if (symnode) this.parser.crntstbl.add_node(symnode)
    
    if(!symnode) 
    symnode = this.parser.crntstbl.get(fcname);
    
    //run able code
    if(
      this.parser.modules.is_parse &&//
      symnode?.key === this.parser.config.app.start
    )
    {
      this.parser.can_run = true;
      symnode.used();
    }

    if(this.is_prs) {
      this.ir.proc(fcname)
      //set zero reg return 
      this.ir.mov(0,0);
    }

    this.parser.focuses.defind(symnode)
    this.parser.ec.body_begin(0, keywords.FUNCTION)
    this.parser.focuses.pop()

  }
  func_scop = (scop_key: any) => {
    return scop_key === keywords.FUNCTION && this.parser.crntstbl.last!
  }
  out_scop = () => {
    const parent = this.parser.crntstbl.parrent!
    if(parent) this.parser.crntstbl = parent
  }
  goto_scop = (scop_key: string | number) => {
      //get scop node
      let  symscop: ISymbol = new Sym(scop_key, sym.NIL);
      const fcs = this.parser.focuses.focus;

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

    while(this.stmt(scop, skop_key)) {
      //empty
    }

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
    else if (!typeCheking.is_empty(this.expr().type)) {
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
    //skip return token
    this.parser.next()
    const t = this.expr()
    const func = this.parser.focuses.last_with(StatusIDEN.DEFINED);

    if(this.is_prs  && func?.type != t.type){
      this.parser.logger.ret_type_mismatch(func?.key,func?.type!,t.type);
    }

    if (this.parser.in_follow(';')) this.parser.next()
    //if next token is not semicolon solved error during
    if(this.is_prs) {
      //move to r0 for return value
      if(t.things){
        const action = t.things.is_num? this.ir.mov:this.ir.movr
        action(0,t.things.val);
      }
      this.ir.ret()
    }
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
    let  exp :ConceptualValues<EpxrType,ExprCV | null> = cv(sym.NIL,null) 
    this.parser.capsolate('(', ')',()=> (exp = this.iden_of_expr()), false)
    
    const arg0 = zero(this.parser.func_arg.len)
    ? new Sym(undefined, 0)
    : this.parser.func_arg.symbols[0]
    
    arg0.set_index(0)
    if(this.is_prs) arg0.set_reg(this.ir.reg);

    if(this.is_prs)
    {
          
    const begin = this.ir.label 
    const end   = this.ir.label
    //checking arr loop if expr is arr
    if(exp.type === sym.ARRAY){
      this.ir.wlbl(begin)
      //get on mem allocate
    } 
    //checking num loop if expr is num
    if(exp.type === sym.INT){
      //counter
      const cnt_reg = this.ir.reg
      const rid = arg0.get_reg
      const rcmp = arg0.get_reg
      const rexp=exp.things?.val
      //initial
      this.ir.mov(rid,0);
      this.ir.mov(cnt_reg,1);
      
      this.ir.wlbl(begin)  
      //rid <= rexp => rcmp = 1
      this.ir.lteq(rcmp,rid,rexp);
      //rcmp = 0 => goto end
      this.ir.jz(rcmp,this.ir.slabel(end));
      this.ir.add(rid,rid,cnt_reg);
    }
    
    //start body
    this.parser.ec.body_begin(scop, keywords.FOREACH)
    
    //go to begin foreach
    this.ir.jmp(this.ir.slabel(begin));
    
    this.ir.wlbl(end)
  }
  else{
    this.parser.ec.body_begin(scop, keywords.FOREACH)
  }
    
    //pop iden of expr definition varable
    if (this.parser.focuses.focus?.is_foreach) {
      this.parser.focuses.pop()
    }
  }
  iden_of_expr():ConceptualValues<EpxrType,ExprCV | null> {
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
        const rightof = this.expr()
        this.parser.ec.foreach_in_expr_type(rightof.type)
        //accepted
        return rightof
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
   
    return cv(sym.NIL,null);
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
      if (this.parser.crntstbl.exist(name!)) {
        this.parser.logger.is_decleared(name!)
      }
      else {
        const sym = this.parser.crntstbl.put(name!, type, false)
        sym!.set_reg(this.ir.reg)
      } 
    }
    return true
  }
  expr(): ConceptualValues<EpxrType,ExprCV | null> {
    const flw = this.parser.first_follow
    if (
      tokChecker.is_iden(flw) ||
      tokChecker.is_num(flw) ||
      this.parser.in_follow('!', '+', '-', '(')
    ) {
      return this.conditionl_expr()
    }
    return cv(sym.EMPTY,null)
  }
  act_with_oprand(rl:number,rr:number,oprnd:string):number{
    if(!this.is_prs) return -1
    const {add,sub,mul,div,mod,lt,lteq,gt,gteq,eq,neq,and,or} = this.ir
    let action = null;
    switch(oprnd)
    {
      case "-" : action = sub;  break;
      case "-" : action = sub;  break;
      case "+" : action = add;  break;
      case "*" : action = mul;  break;
      case "/" : action = div;  break;
      case "%" : action = mod;  break;
      case "==": action = eq;   break;
      case "!=": action = neq; break;
      case ">" : action = gt;   break;
      case "<" : action = lt;   break;
      case ">=": action = gteq; break;
      case "<=": action = lteq; break;
      case "&&": action = and; break;
      case "||": action = or; break;
      default  : return -1
    }
    const newReg = this.ir.reg

    action(newReg,rl,rr);

    return newReg;
  }
  conditionl_expr(): ConceptualValues<EpxrType,ExprCV | null>
  {
    const {type,things} = this.assign_expr()
    if(!this.parser.in_follow("?"))
      return cv(type,things)
    
    this.parser.next();

    let err: boolean = false
    const lexp = this.expr();
    if(is_empty(lexp.type)){
      err=true
      this.parser.logger.syntax_err("expersion prev : can not be empty");
    }
      
    if(this.parser.in_follow(":"))
      this.parser.next();
    else
      this.parser.logger.syntax_err("expected : after experison in conditional experssion");
    
    const rexp = this.expr();

    if(is_empty(rexp.type))
    {
      err=true
      this.parser.logger.syntax_err("expersion after : can not be empty");
    }
    if(!err && lexp.type != rexp.type)
    {
      if(this.module.is_parse)
        this.parser.logger.mismatch_type_conditional(lexp.type,rexp.type);
      err = true;
    }
    
    //re ? rl : rl
    /*
        jz re , esle
        r = rl
        jmp end
      else:
        r = rr
      end:
    */ 
   let reg
    if(this.is_prs)
    {
      reg = this.ir.reg
      const els = this.ir.label;
      const end = this.ir.label;
      
      this.ir.jz(things?.val,this.ir.slabel(els))
      this.ir.mov(reg,lexp.things?.val)
      this.ir.wlbl(els)
      this.ir.jmp(this.ir.slabel(end))
      this.ir.mov(reg,rexp.things?.val)
      this.ir.wlbl(end)
    }

    return cv(err ? sym.NIL : lexp.type,{val:reg})
  }
  assign_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type,things} = this.or_expr()
    let err: boolean = false
    let rl = things?.val
    while (this.parser.in_follow('=')) {
      this.parser.next()
      const exp = this.or_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal assignment!')
      }
      
      const rr = exp.things?.val

      if(this.is_prs) this.ir.movr(rl,rr); 

      rl =rr
    }

    return cv(err ? sym.NIL : type,things)
  }

  or_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {things,type} = this.and_expr()
    let err: boolean = false  
    let out,rl;
    let r = things?.val
    if(this.is_prs && this.parser.in_follow('||'))
    {
        out = this.ir.slabel(this.ir.label);
        rl = things?.val;
        r = this.ir.zero_reg;
        this.ir.jnz(rl,out);
        this.ir.movr(r,rl);
    }

    while (this.parser.in_follow('||')) {
      this.parser.next()
      const exp = this.and_expr()

      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal or expression !')
      }

      if(this.is_prs && out){
        rl = exp.things?.val;
        this.ir.jnz(rl,out);
        this.ir.movr(r,rl);
      }
    }

    if(out) this.ir.nwrite(out);

    return cv(err ? sym.NIL : type,{val:r})
  }

  and_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {things,type} = this.equ_expr()
    let err: boolean = false
    let out,rl;
    let r = things?.val
        
    if(this.is_prs && this.parser.in_follow('&&')){
        rl = things?.val
        r = this.ir.zero_reg;
        out = this.ir.slabel(this.ir.label);
        this.ir.movr(r,rl);
        this.ir.jz(rl,out);
    }
      
    while (this.parser.in_follow('&&')) {      
      this.parser.next()
      const exp = this.equ_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal and expression !')
      }

      if(this.is_prs && out){
        rl = exp.things?.val;
        this.ir.movr(r,rl);
        this.ir.jz(rl,out);
      }
    }

    if(out) this.ir.nwrite(out);

    return cv(err ? sym.NIL : type,{val:r})
  }
  equ_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type,things:th} = this.relational_expr()
    let err: boolean = false
    
    let rl = th?.val;
    

    while (this.parser.in_follow('==', '!=')) {
      const oprnd = this.parser.first_follow.val!;
      
      this.parser.next()
      const exp = this.relational_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal equality expression !')
      }
      
      const rr = exp.things?.val
      rl = this.act_with_oprand(rl,rr ,oprnd)
      
    }

   
    return cv(err ? sym.NIL : type,{val:rl})
  }

  relational_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    const {things,type} = this.add_expr()
    let err: boolean = false
    let rl =  things?.val

    while (this.parser.in_follow('>', '<', '>=', '<=')) {
      const oprnd = this.parser.first_follow.val!;
      this.parser.next()
      const exp = this.add_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal relational expression !')
      }
    
      const rr = exp.things?.val 
      rl = this.act_with_oprand(rl,rr,oprnd);
      
    }
    return cv(err ? sym.NIL : type,{val:rl})
  }

  add_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type:typ,things:th} = this.mul_expr()
    let _in = false
    
    //left reg
    let rl =  th?.val

    while (this.parser.in_follow('+', '-')) {
      const oprnd = this.parser.first_follow.val!;
      if (typ != sym.INT)
        this.parser.logger.incompatible_oprands()
      this.parser.next()
      const exp = this.mul_expr() 

      const rr = exp.things?.val 
      rl = this.act_with_oprand(rl,rr,oprnd);
      
      typ = exp.type
      _in = true
    }
    if (typ != sym.INT && _in)
      this.parser.logger.incompatible_oprands()
    return  cv(typ,{val:rl})
  }

  mul_expr(): ConceptualValues<EpxrType,ExprCV | null>  {
    let {type:typ,things:th} = this.unary_expr()
    let _in = false
   
    //left reg
    let rl =  th?.val

    while (this.parser.in_follow('*', '/', '%')) {
      const oprnd = this.parser.first_follow.val!;

      if (typ != sym.INT)
      this.parser.logger.incompatible_oprands()
      this.parser.next()
      
      const exp = this.unary_expr()    
      const rr = exp.things?.val
      
      if(this.is_prs && rr)
        rl = this.act_with_oprand(rl,rr,oprnd);
      
      typ = exp.type
      _in = true
    }
    if (typ != sym.INT && _in)
      this.parser.logger.incompatible_oprands()
    
    return cv(typ,{val:rl})
  }
  unary_oprator(): boolean {
    if (this.parser.in_follow('+', '-', '!')) {
      this.parser.next()
      return true
    }
    return false
  }
  unary_expr(): ConceptualValues<EpxrType,ExprCV | null>  {
    while (this.unary_oprator());
    const exp =  this.postfix_expr()

    return exp
  }
  index_arr_expr(symnode: ISymbol): ConceptualValues<EpxrType,ExprCV | null> {
    //[ expr
    const exp = this.expr()
    //expr should be INT
    this.parser.ec.expr_array_index_type(symnode, exp.type)
    // expr ]
    this.parser.ec.expr_array_end_bracket(symnode)

    return exp
  }
  postfix_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let{type:typ,things} = this.prim_expr()
    const fsym = this.parser.focuses.focus?.sym!
    let isArr = typ === sym.ARRAY 
    let exp_ind;
    if(!isArr && fsym)
      this.parser.ec.expr_array_start_bracket(fsym, typ)
    //cleaner code arrow function
    const moved_type = () => {
      exp_ind = this.index_arr_expr(fsym)
      typ = exp_ind.type
    }
    //if array change status symbol to array
    let start_braket = false;
    
    while (this.parser.in_follow('[')) 
    {
      start_braket = true;
      this.parser.capsolate('[', ']', moved_type, false, false)
    }
    if(isArr && start_braket) 
      this.parser.focuses.pop();

    return cv(start_braket ? sym.INT : typ,things);
  }
  prim_expr():ConceptualValues<EpxrType,ExprCV | null> {
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
      let reg = iden?.get_reg;
      if (this.parser.in_follow('(',"[")){
        if (iden) this.parser.focuses.call(iden)
        //if expr not founded in symbol table
        else this.parser.focuses.free(val)
        //blow code parsed ( flist ) grmaer
        if (this.parser.in_follow('(')) {
          const f = this.parser.focuses.focus!;
          this.parser.ec.expr_iden_is_func(f.sym!, exist)
          //out of function expresion
          if(this.is_prs && f.is_call){
            const args =this.get_arg_regs(f.sym!)
            const fname = f.sym!.key as string
          
            this.ir.call(fname,...args);
            reg = 0;
          }
          this.parser.focuses.pop()
        }
      }
      return cv(iden ? iden.type! : sym.NIL,{ val : reg })
    } //
    if (tokChecker.is_num(tok)) {
      this.parser.next()
      let _v:any = {} 
      //mov r,num
      if(this.is_prs){
        _v.val = this.ir.reg
        const num = +tok.val!;
        this.ir.mov(_v.val,num); 
      }

      return cv(sym.INT,_v)
    }
    //
    if (tok.val == '(') {
      let type: EpxrType = sym.NIL
      let _v = null;
      this.parser.capsolate('(', ')', () => {
        _v = this.expr()
        type = _v.type
        _v = _v.things
      })

      return cv(type,_v)
    }
    //todo something to check
    if (this.parser.in_follow(')', ']', ';', '}')) return cv(sym.NIL,null)
   
    if(this.module.is_pre)
      this.parser.logger.log_with_line('primary expression is not ok!')
   
    this.parser.next()
    return cv(sym.NIL,null)
  }
  get_arg_regs(func:ISymbol):number[]{
    const regs :number[] = [];
    
    if(this.module.is_pre || !func.subTables)
      return regs
    const syms = func.subTables.symbols;
    for(let c = 0;c < func.param_counts;c++)
      regs.push(syms[c].get_reg);
    
    return regs;
  }
  get is_prs(){return this.parser.modules.is_parse}
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
      arg.set_reg(this.ir.reg);
      this.parser.func_arg.add_node(arg)
    }

    //skeep for counting
    if (this.parser.in_follow(',')) {
      this.parser.next()
    }
    return 1 + this.flist(pos + 1)
  }

  clist(pos: number = 0): number {
    const exp = this.expr()
    const empty = typeCheking.is_empty(exp.type)
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
      if (!same_type(arg_at_pos.type!, exp.type)) {
        const ctyp = arg_at_pos.type!
        const btyp = exp.type
        const fname = snodefcs.sym?.key! as string
        this.parser.logger.type_mismatch_arg_func(pos, fname, btyp, ctyp)
      }
      //move expr reg to reg arg func
      this.ir.movr(arg_at_pos.get_reg,exp.things?.val);
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
