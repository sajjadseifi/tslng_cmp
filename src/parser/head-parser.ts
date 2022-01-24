import { Compiler, SharedCompier } from '../compiler'
import { Sym } from '../symbol'
import { ISymbol, Nullable, SymbolType } from '../types'
import { keywords } from '../constants'
import {
  is_begin,
  is_end,
  is_iden,
  is_lprns,
  is_rprns,
  is_type
} from '../utils/token-cheker'
import { TesParser } from './tes-parser'
import { IParser, SubParser } from './types'
import { read_range } from '../io'
import { TSIR } from 'src/ir/tes-IR'

  /*
    prog := func |
            func prog |

    func := fc ; |
            fc : ass-body end

    fdec := type iden(flist) 

    
    ass-body := 

  */
export class HeadeParser extends SubParser implements IParser {
  private tesprs:TesParser
  private cmp:Compiler
  private ir:TSIR
  constructor(compiler: SharedCompier)
  {
    super(compiler)
    
    this.cmp= this.compiler as Compiler

    this.tesprs = new TesParser(this.cmp)
    this.ir = this.cmp.ir as TSIR 
  }
  parse(): void {
      this.prog()
  }

  prog(): void {
    if (this.parser.lexer.finished) return
    this.func()

    this.prog()
  }
  func(): void {
    this.ir.reset_reg();
    this.fdec()
    //body stmt for use assembely code
    if (is_begin(this.parser.first_follow)){
      const func = this.parser.crntstbl.last! 

      this.ir.proc(this.parser.linking(func))
      
      let code = this.body()
      //add arg description
      // code = this.arg_to_reg(func,code)
      //write builtin code
      this.ir.nwrite(code);
    }
    //
    else if (this.parser.in_follow(';')) this.parser.next()
    //
    else if (this.parser.modules.is_pre) this.parser.logger.expect_sem_error()
  }
  fdec(): void {
    if(this.parser.lexer.finished) return;

    if(!is_type(this.parser.first_follow)){
      console.log("expected type");
      process.exit(1);
    }
    let type = this.tesprs.type() as SymbolType;

    if(!is_iden(this.parser.first_follow)){
      console.log("expected iden");
      process.exit(1);
    }
    const fcname = this.parser.next().val!;
    //create function symbol node
    let symnode: Nullable<ISymbol> = null

    symnode = new Sym(fcname)
    symnode.to_pub()

    if(!is_lprns(this.parser.first_follow)){
      console.log("expected (");
      process.exit(1);
    }
    this.parser.next();
    //get flist
    const prmc = this.tesprs.flist(0,true);
    //
    symnode.set_prms_count(prmc)
    const token = this.parser.first_follow;

    if(!is_rprns(token)){
      console.log("expected )");
      process.exit(1);
    }
    //
    this.parser.next();
    //
    symnode.set_type(type as SymbolType)
    symnode.set_likner(this.parser.modules.plex.fd);
    this.parser.crntstbl.add_node(symnode)

    this.arg_passanger(symnode);
    
  }
  body(): string {
    //
    let code = '';
    this.parser.capsolate(keywords.BEGIN,keywords.END,()=>{
      const start = this.parser.lexer.char_index + 1
      /***
       *
       * ass-body parser generation
       *
       ***/
      //skip if  showed 'end' token
      this.parser.token_skipper(()=>this.skipper_checker()) 
      
      const end = this.parser.lexer.char_index + 1
      code = read_range(this.parser.modules.plex.fd,start,end);
    })
    code = '\t' + code.trim();
    return code;
  }

  skipper_checker(): boolean {
    const [t1, t2] = this.parser.follow(3)
    //end of check
    if (is_end(t1)) return true
    //if person forget end blcok and then see type token
    if (is_type(t1)  && is_iden(t2)) return true
    //
    if (is_iden(t1)  && is_lprns(t2)) return true
    //( for first toen
    if (is_rprns(t1) || is_lprns(t1)) return true

    //skip
    return false
  }
  arg_passanger(symnode:ISymbol):void{
    const sindex = this.parser.crntstbl.index_by_name(symnode.key as string);
    symnode.init_subtable(this.parser.crntstbl,sindex)
    symnode.subTables!.join(this.tesprs.parser.func_arg)
    this.parser.func_arg.clear()
  }
  arg_to_reg(func:ISymbol,code?:string):string{
    const syms = func.subTables!.symbols
    for (let c = 0; c < func.param_counts; c++) {
      if(syms[c] === null || syms[c] === undefined) continue;
      const name = `[${syms[c].key! as string}]`;
      const reg = syms[c].get_reg;
      if(code)
        code = code.split(name).join(this.ir.sreg(reg))
      else 
        this.ir.ntwrite(`${name}=${reg}`);
    }

    return code || ""
  }
  
}
