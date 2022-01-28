import * as TIT from "src/AST/TS-IR-Tree"
import { Nullable } from "src/types"
import { utils } from "./utils"
const getToken =()=>{ 
    return "" 
}
const dropToken =()=>{ 
    return "" 
}
const eof = () => {
    return true
}
export const ir_ptree = () => prog();
const prog = () : TIT.Prog => {
    if(eof()) return new TIT.Prog1()

    return new TIT.Prog2(proc(),prog())
}
const proc =()=>{
    if(dropToken() != "proc") 
        throw new Error("function must declared by proc keyword");

    return new TIT.Proc(iden(),body());
}
const body = () : TIT.Body => {
    const st = stmt();

    return st 
        ? new TIT.Body2(st,body()) 
        : new TIT.Body1() 
}
const stmt = () : Nullable<TIT.Stmt> => {
    const state =(
        mov_stmt()  ||
        add_stmt()  ||
        mul_stmt()  ||
        call_stmt() ||
        ld_stmt()   ||
        st_stmt()   ||
        j_stmt()    ||
        ret_stmt()
    )
    if(state)
        return  new TIT.Stmt(state)

    return null
}
const mov_stmt = () : Nullable<TIT.MovNum | TIT.MovReg> => {
    if(getToken() !="mov") return null;
    const r = reg()
    
    if(dropToken() !=",") throw new Error("after first reg you must add comma");

    if(utils.isnum(getToken()))
        return new TIT.MovNum(r,num())
    
    return new TIT.MovReg(r,reg())
}
const add_stmt = () : Nullable<TIT.Add> => {
    const op = getToken()
    if(!(op == "add" || op == "sub")) return null;
    return new TIT.Add(isa3())       
}
const mul_stmt = () : Nullable<TIT.Mul>=> {
    const op = getToken()
    if(!(op == "mod" || op == "mul" || op == "div")) return null;
    return new TIT.Mul(isa3())
}
const call_stmt = () : Nullable<TIT.Call> => {
    if(getToken() != "call") return null;
    return new TIT.Call(carg())
}
const ld_stmt=() : Nullable<TIT.Load> =>{
    if(getToken() != "ld") return null;
    return new TIT.Load(isa2())
}
const st_stmt=() : Nullable<TIT.Store> =>{
    if(getToken() != "st") return null;
    return new TIT.Store(isa2())
}
const j_stmt=():Nullable<TIT.Jump>=>{
    if(getToken() == "jmp"){
       dropToken()
       return new TIT.Jmp(label())    
    }

    if(getToken() =="jz" || getToken() =="jnz"){
        const code = dropToken() as TIT.JXZType;
        const r = reg()
        if(getToken() !=",") throw new Error("this place must be comma")
        return new TIT.JxZ(code,r,label())
    }

    return null
}
const label = () =>{
    if(utils.isiden(getToken()))
        return new TIT.Lable(dropToken())

    throw new Error("this place must be label code")
}
const ret_stmt = (): Nullable<TIT.Ret> => {
    if(getToken() != "ret") return null;
    return new TIT.Ret()
}
const carg = () : TIT.Carg => {
    if(!utils.isreg(getToken())) return new TIT.Carg1()
    
    const rast = reg()

    if(getToken() != ",") return new  TIT.Carg2(rast)

    return new TIT.Carg3(rast,carg())
}
const isa2 = () : TIT.ISA2 => {
    const ast1 = reg();
    
    if(getToken() != ",") 
        throw new Error("you must place comma after first register");

    dropToken();
    
    return new TIT.ISA2(ast1,reg());
}
const isa3 = () : TIT.ISA3 => {
    const ast = isa2();
    
    if(getToken() != ",") 
        throw new Error("you must place comma after isa2");

    dropToken();

    return new TIT.ISA3(ast,reg());
}
const reg = (): TIT.Reg => {
    if(utils.isreg(getToken()))
        return new TIT.Reg(utils.regc(dropToken()))
    
    throw new Error("token must be a number");    
}
const iden = () : TIT.Iden=> {
    if(utils.isiden(getToken()))
        return new TIT.Iden(dropToken())
    
    throw new Error("token must be a number");    
}
const num = ()  : TIT.Num => {
    if(utils.isnum(getToken()))
        return new TIT.Num(utils.tonum(dropToken()))
    
    throw new Error("token must be a number");
}