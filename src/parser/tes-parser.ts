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
import { IFocuse } from 'src/types/focus'

export interface ConceptualValues<T,A>
{
  type:T,
  things:A
}
export interface ExprCV{
  val:any
  mem?:boolean
}
export const cv=<T,A>(type:T,things:A):ConceptualValues<T,A>=>({type,things})

let  out_fc  : number = -1
let  nested_labs  : number[] = []
let  ret_labs : number[] = [] 
let  ret_reg_ref :number[] = []
export class TesParser extends SubParser implements IParser, IParserRD {
  module: IModule
  ir:TSIR
  constructor(public cmp: Compiler) {
    super(cmp)
    this.module = this.parser.module_node!.value!
    this.ir = this.cmp.ir as TSIR
  }
  get last_nested_labs():number{
    return nested_labs[nested_labs.length-1]
  }
  get last_nested_labs_str():string{
    return this.ir.slabel(this.last_nested_labs)
  }
  parse(): void {
    this.prog()
    if(this.is_prs) {
      this.ir.wlbl(-1);
      this.ir.ret()
    }
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
    this.ir.reset_reg();
   
    if(this.is_prs)
      out_fc = this.ir.label 
    

    if (!tok || is_eof(tok)) return

    if (is_pub(tok)) {
      pub = true
      this.parser.next()
    }
    //starter function
    this.parser.ec.function_start()
    //get name of function
    fcname = this.parser.ec.function_in_iden()!
    console.log({fcname});
    //create function symbol node
    let symnode: Nullable<ISymbol> = null

    if (this.module.is_pre) {
      symnode = new Sym(fcname)
      symnode.init_subtable(this.parser.crntstbl)
    }
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
    this.ir.reset_reg(prmc);
    //returns place
    this.parser.ec.function_in_return()
    
    /* Return Typeing */
    type = this.parser.ec.function_return_type()
    symnode?.set_type(type as SymbolType)
    
    if (symnode) this.parser.crntstbl.add_node(symnode)
    
    if(!symnode) 
      symnode = this.parser.crntstbl.get(fcname);
    //public function
    if (pub) symnode!.to_pub()
    //run able code
    if(this.is_prs)
    {
      
      if(this.cmp.starter(fcname))
      {
        this.parser.can_run = true;
        symnode!.used();
      }
      else 
        symnode!.set_likner(this.module.plex.fd);

      if(!symnode!.is_used) this.ir.disabled() 
    }

    if(this.is_prs) 
      this.ir.proc(this.parser.linking(symnode!))
    
    this.parser.focuses.defind(symnode)
    this.parser.ec.body_begin(0, keywords.FUNCTION)
    this.parser.focuses.pop()

    //out
    if(this.is_prs) {
      this.ir.wlbl(out_fc)
      this.ir.ret()

    }
    this.ir.enabled()
  }
  func_scop = (scop_key: any) => {
    return scop_key === keywords.FUNCTION && this.parser.crntstbl.last!
  }
  out_scop = () => {
    // const scop_regs = this.parser.crntstbl.regs_used
    // const free_regs = scop_regs

    // this.ir.free_all(...free_regs);
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
    else if (tokChecker.is_break(tok)) {
      this.parser.next();
      this.ir.jmp(this.last_nested_labs_str);
      this.parser.ec.forget_sem();
    }
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
      this.parser.ec.forget_sem();
    }
    //expr
    else if (!typeCheking.is_empty(this.expr().type)) {
      this.parser.ec.forget_sem();
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
        let r = t.things.val
        this.ir.movr(0,r);
      }
      this.ir.jmp(this.ir.slabel(out_fc))
    }
  }
  if_stmt(scop: number) {
    this.parser.next()
    let  exp :ConceptualValues<EpxrType,ExprCV | null> = cv(sym.NIL,null) 

    this.parser.capsolate('(', ')',()=> exp = this.expr(), false)

    let end =null 
    if(this.is_prs){
      end = this.ir.label
      this.ir.jz(exp.things?.val,this.ir.slabel(end));  
    }
    this.parser.ec.body_begin(scop, keywords.IF)

    if (this.parser.in_follow(keywords.ELSE)) {
      this.parser.next()
      let els= null
      if(this.is_prs)
      {
        els = end!
        end = this.ir.label
        //
        this.ir.jmp(this.ir.slabel(end))
        this.ir.wlbl(els); 
      }

      this.parser.ec.body_begin(scop, keywords.ELSE)
    }
    
    if(this.is_prs && end) this.ir.wlbl(end); 
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
      if (this.module.is_parse){
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
    let  exp :ConceptualValues<EpxrType,ExprCV | null> = cv(sym.NIL,null) 

    const begin = this.ir.label
    const end = this.ir.label
    
    if(this.is_prs)
      this.ir.wlbl(begin);
  
    this.parser.capsolate('(', ')',()=> exp = this.expr(), false)

    if (this.parser.in_follow(keywords.DO)) this.parser.next()
    
    //if r == 0 goto out

    if(this.is_prs){
      const rexp = exp.things?.val 
      this.ir.jz(rexp,this.ir.slabel(end));
    }
    nested_labs.push(end);
    this.parser.ec.body_begin(scop, keywords.WHILE)
    nested_labs.pop();
    
    if(this.is_prs) {
      this.ir.jmp(this.ir.slabel(begin));
      this.ir.wlbl(end);
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
      const rid   = arg0.get_reg
      const rexp  = exp.things?.val
      const rcmp  = this.ir.reg
      const ro    = this.ir.bit_reg
      //checking arr loop if expr is arr
      if(typeCheking.is_array(exp.type)){
        //get sizeof array load size in memeory
        const rsize = this.ir.reg
        const rref    = this.ir.reg
        const rbyte    = this.ir.byte_reg
        //reg_size = reg_arr & load in mem
        this.ir.movr(rsize,rexp)
        this.ir.ld(rsize,rsize)
        //get on mem allocate
        this.ir.movr(rref,rexp)
        //label foreach
        this.ir.wlbl(begin)
        //rcmp <- (rsize >= 1)  := 1
        this.ir.gteq(rcmp,rsize,ro)
        //rcmp := 0 -> goto end 
        this.ir.jz(rcmp,this.ir.slabel(end))
        //rsize = rsize - 1
        this.ir.sub(rsize,rsize,ro)
        //index + 1
        this.ir.add(rref,rref,rbyte)
        //id = Expr[index]
        this.ir.ld(rid,rref)
      } 
    //checking num loop if expr is num
      if(typeCheking.is_int(exp.type)){
        //initial
        this.ir.mov(rid,0);
        // const ind_reg = this.ir.zero_reg
        //label
        this.ir.wlbl(begin)  
        //rid <= rexp => rcmp = 1
        this.ir.lteq(rcmp,rid,rexp);
        //rcmp = 0 => goto end
        this.ir.jz(rcmp,this.ir.slabel(end));
      }   
      //start body
      nested_labs.push(end);
      this.parser.ec.body_begin(scop, keywords.FOREACH)
      nested_labs.pop();
      //itrable reg
      
      if(typeCheking.is_int(exp.type))
        this.ir.add(rid,rid,ro);  
      
      //go to begin foreach
      this.ir.jmp(this.ir.slabel(begin));
      //end label
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
    if(this.is_prs)
    {
      const sym = this.parser.crntstbl.get(name!)
      if (!sym) {
        this.parser.logger.is_decleared(name!)
      }
      else if(sym.is_used){
        sym.set_reg(this.ir.reg)
      }
    }
    else if (this.module.is_pre){
      this.parser.crntstbl.put(name!, type, false)
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
  act_with_oprand(rl:ExprCV | null,rr:ExprCV | null,oprnd:string):ExprCV | null{
    if(!this.is_prs || !rl || !rr) return null
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
      default  : return null
    }
    const newReg = this.ir.reg
    //load array cell left
    this.load_mem_or_reg(rl);
    //load array cell right
    this.load_mem_or_reg(rr);
    //caclulate or cmp 
    action(newReg,rl.val,rr.val);

    return { val : newReg }
  }
  
  //return loaded register in memory
  load_mem_or_reg(...rs:(ExprCV|null)[]):number[]{
    let r;
    return rs.filter(e=>e && e.mem == true).map((e)=>{
      r = e!.val
      this.ir.ld(r,r)
      return r 
    })
  }
  //return stored register to memory allocate
  store_mem_or_reg(...rs:(ExprCV|null)[]):number[]{
    let r;
    return rs.filter(e=>e && e.mem == false).map((e)=>{
      r= e!.val
      this.ir.st(r,r)
      return r
    })
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
      const rl = lexp.things;
      const rr = rexp.things;

      this.load_mem_or_reg(rl);
      this.load_mem_or_reg(rr);

      this.ir.jz(things?.val,this.ir.slabel(els))
      this.ir.mov(reg,rl?.val)
      this.ir.wlbl(els)
      this.ir.jmp(this.ir.slabel(end))
      this.ir.mov(reg,rr?.val)
      this.ir.wlbl(end)
    }

    return cv(err ? sym.NIL : lexp.type,{val:reg})
  }
  assign_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type,things:rl} = this.or_expr()
    let err: boolean = false
    while (this.parser.in_follow('=')) {
      this.parser.next()
      const exp = this.or_expr()

      if(this.is_prs) {
        if (type != exp.type) {
          err = true
          this.parser.logger.semantic_err('illegal assignment!')
        }
  
        const rr = exp.things!
        //meme == false mean calculate r2,r3  set to r1 
        if(rr.mem)
          this.ir.st(rr?.val,rl?.val) 
        else 
          this.ir.movr(rr?.val,rl?.val)
        rl = rr
      }
    }

    return cv(err ? sym.NIL : type,rl)
  }
  or_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {things:rl,type} = this.and_expr()
    let err: boolean = false  
    let out,r:any;
    if(this.is_prs && this.parser.in_follow('||'))
    {
        out = this.ir.label;
        r = this.ir.zero_reg;
        this.load_mem_or_reg(rl)
        this.ir.jnz(rl?.val,this.ir.slabel(out));
        this.ir.movr(r,rl?.val);
    }

    while (this.parser.in_follow('||')) {
      this.parser.next()
      const exp = this.and_expr()

      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal or expression !')
      }

      if(this.is_prs && out){
        rl = exp.things;
        this.load_mem_or_reg(rl)
        this.ir.jnz(rl?.val,this.ir.slabel(out));
        this.ir.movr(r,rl?.val);
      }
    }

    if(out) this.ir.wlbl(out);
    
    const th = r ? {val:r} : rl

    return cv(err ? sym.NIL : type,th)
  }
  and_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {things:rl,type} = this.equ_expr()
    let err: boolean = false
    let out,r:any;
    
    if(this.is_prs && this.parser.in_follow('&&')){
        r = this.ir.zero_reg;
        out = this.ir.label;
        this.load_mem_or_reg(rl)
        this.ir.movr(r,rl?.val);
        this.ir.jz(rl?.val,this.ir.slabel(out));
    }
      
    while (this.parser.in_follow('&&')) {      
      this.parser.next()
      const exp = this.equ_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal and expression !')
      }

      if(this.is_prs && out){
        rl = exp.things;
        this.load_mem_or_reg(rl)
        this.ir.movr(r,rl?.val);
        this.ir.jz(rl?.val,this.ir.slabel(out));
      }
    }

    if(out) this.ir.wlbl(out);

    const th = r ? {val:r} : rl

    return cv(err ? sym.NIL : type,th)
  }
  equ_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type,things:rl} = this.relational_expr()
    let err: boolean = false
    
    while (this.parser.in_follow('==', '!=')) {
      const oprnd = this.parser.first_follow.val!; 
      this.parser.next()
      const exp = this.relational_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal equality expression !')
      }

      const rr = exp.things
      rl = this.act_with_oprand(rl,rr ,oprnd)
      
    }

   
    return cv(err ? sym.NIL : type,rl)
  }
  relational_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type,things:rl} = this.add_expr()
    let err: boolean = false

    while (this.parser.in_follow('>', '<', '>=', '<=')) {
      const oprnd = this.parser.first_follow.val!;
      this.parser.next()
      const exp = this.add_expr()
      
      if (type != exp.type) {
        err = true
        this.parser.logger.syntax_err('illegal relational expression !')
      }
    
      const rr = exp.things 
      rl = this.act_with_oprand(rl,rr,oprnd);
      
    }
    return cv(err ? sym.NIL : type,rl)
  }
  add_expr(): ConceptualValues<EpxrType,ExprCV | null> {
    let {type:typ,things:rl} = this.mul_expr()
    let _in = false
    
    while (this.parser.in_follow('+', '-')) {
      const oprnd = this.parser.first_follow.val!;
      if (typ != sym.INT)
        this.parser.logger.incompatible_oprands()
      this.parser.next()
      
      const exp = this.mul_expr() 
      const rr = exp.things

      rl = this.act_with_oprand(rl,rr,oprnd);
      
      typ = exp.type
      _in = true
    }
    if (typ != sym.INT && _in)
      this.parser.logger.incompatible_oprands()
    return  cv(typ,rl)
  }
  mul_expr(): ConceptualValues<EpxrType,ExprCV | null>  {
    let {type:typ,things:rl} = this.unary_expr()
    let _in = false

    while (this.parser.in_follow('*', '/', '%')) {
      const oprnd = this.parser.first_follow.val!;

      if (typ != sym.INT)
      this.parser.logger.incompatible_oprands()
      this.parser.next()
      
      const exp = this.unary_expr()    
      const rr = exp.things
      
      rl = this.act_with_oprand(rl,rr,oprnd);

      typ = exp.type
      _in = true
    }
    if (typ != sym.INT && _in)
      this.parser.logger.incompatible_oprands()
    
    return cv(typ,rl)
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
    let{type:typ,things:rl} = this.prim_expr()
    const fsym = this.parser.focuses.focus?.sym!
    let isArr = typ === sym.ARRAY 
    let exp_ind:ConceptualValues<EpxrType,ExprCV | null>;
    if(!isArr && fsym)
      this.parser.ec.expr_array_start_bracket(fsym, typ)
    //if array change status symbol to array
    let start_braket = false;
    
    while (this.parser.in_follow('[')) 
    {
      start_braket = true;
      this.parser.capsolate('[', ']', ()=>(exp_ind = this.index_arr_expr(fsym)), false, false)
      typ = exp_ind!.type 

      if(!this.is_prs) continue;

      //reg [array,index,1]
      const ra = rl?.val
      const ri = exp_ind!.things?.val
      const rone = this.ir.reg;
      const rfree = this.ir.reg
      //free one value for add to index
      this.ir.mov(rone,1);
      //cell is 8 bit
      this.ir.mov(rfree,8);
      // i = (i+1) => 0 index data is array length
      this.ir.add(ri,ri,rone);
      //rfree = 8 * (i+1)
      this.ir.mul(rfree,rfree,ri); 
      //rfree = *ra + rfree => cell address 
      this.ir.add(rfree,rfree,ra); 
      //return array cell register
      if(rl) {
        rl.val = rfree
      }
    }

    if(isArr && start_braket)
      this.parser.focuses.pop();
    
    return cv(start_braket ? sym.INT : typ,rl);
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
      if (iden){
        if(this.module.is_pre) iden.used()
      }
      //error not defind variable and suggest word this place
      else if (this.is_prs) {
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
          const args = this.parser.ec.expr_iden_is_func(f.sym!, exist)
          //out of function expresion
          if(this.is_prs && f.is_call){            
            const fname = f.sym!.key as string
            
            reg = args.length ? args[0].val : this.ir.reg
            //store in memory arg if not refrneces
            const argr = this.store_mem_or_reg(...args)
            this.ir.call(fname + iden.linker_code,...args.map(r=>r.val));
            //free parameters if stored for call function
            this.ir.free_all(...argr);

          }
          this.parser.focuses.pop()
        }
      }
      return cv(iden ? iden.type! : sym.NIL,{ val : reg, mem : true })
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
  arg_checker_clist(snode:IFocuse,pos:number):boolean{
    return !!(
      this.is_prs && //
      snode && // can be null last fcouses
      snode.sym &&
      snode.is_call && //not free
      snode.sym?.is_func && //is function not identifier
      snode.sym?.param_counts! > pos //position defined function must greater than eq pos
    )
  }
  clist(pos: number = 0,args_out?:ExprCV[]): number {
    const exp = this.expr()
    const empty = typeCheking.is_empty(exp.type)
    const snodefcs = this.parser.fcs
    if (empty) {
      this.parser.logger.arg_empty_call(pos)
    } else if (this.arg_checker_clist(snodefcs,pos)) {
      //get argument at position of symbols
      const arg_at_pos = snodefcs.sym!.subTables!.symbols[pos]
      //mismatch arg defined and arg call function
      if (!same_type(arg_at_pos.type!, exp.type)) {
        const ctyp = arg_at_pos.type!
        const btyp = exp.type
        const fname = snodefcs.sym?.key! as string
        this.parser.logger.type_mismatch_arg_func(pos, fname, btyp, ctyp)
      }
      if(args_out) 
        args_out.push(exp.things!);
    }

    if (this.parser.in_follow(',')) {
      this.parser.next()
      return this.clist(pos + 1,args_out) + 1
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
