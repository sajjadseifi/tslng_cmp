import { FD } from "../io";
import { line, tabline } from "../utils/stringfy";
import { IR } from "./IR";

export interface TSCacl {
    mov(r1:number,num:number):any 
    movr(r1:number,r2:number):any 
    add(r1:number,r2:number,r3:number):any 
    sub(r1:number,r2:number,r3:number):any 
    mul(r1:number,r2:number,r3:number) :any 
    div(r1:number,r2:number,r3:number):any 
    mod(r1:number,r2:number,r3:number):any   
    eq(r1:number,r2:number,r3:number):any 
    lt(r1:number,r2:number,r3:number):any 
    gt(r1:number,r2:number,r3:number):any 
    lteq(r1:number,r2:number,r3:number):any 
    gteq(r1:number,r2:number,r3:number):any 
}
export interface TSCaclcmpplcate {
    neq(r1:number,r2:number,r3:number):any 
    and(r1:number,r2:number,r3:number):any 
    or(r1:number,r2:number,r3:number):any 
}

export interface TSJump{
    jmp(dst:string):any 
    jz(r1:number,dst:string):any
    jnz(r1:number,dst:string):any
}

export interface TSFunc{
    proc(name:string):any
    call(name:string,...regs:number[]):any
    ret():any
}
export interface TSBuiltin{
    iget(r1:number):any//getint
    iput(r1:number):any//printint
    mem(r1:number):any//allocate mem
    rel(r1:number):any//de allocate mem
}
export interface TSOthrs{
    ld(r1:number,r2:number):any
    st(r1:number,r2:number):any
    nop():any
    wlbl(label:number):void
    reg_num(num:number):number
    get zero_reg():number
    get bit_reg():number
    get byte_reg():number
    free_all(...regs:number[]):any
}

export class TSIR 
    extends IR 
    implements TSCacl,TSJump,TSBuiltin,TSFunc,TSOthrs,TSCaclcmpplcate
{

    reg_num(num:number):number{
        const reg = this.reg;
        this.mov(reg,num);
        return reg
    }
    get zero_reg():number{
        return this.reg_num(0)
    }
    get bit_reg():number{
        return this.reg_num(1)
    }
    get byte_reg():number{
        return this.reg_num(8)
    }
    ld(r1:number,r2:number) {
        this.ntwrite(`ld ${this.sreg(r1)},${this.sreg(r2)}`);
    }
    st(r1:number,r2:number) {
        this.ntwrite(`st ${this.sreg(r1)},${this.sreg(r2)}`);
    }
    wlbl(label: number): void {
        if(label == -1)
            this.nwrite("_exit:");
        else 
            this.nwrite(this.slabel(label)+":");
    }
    private seq_regs(...regs:number[]):string{
        return regs.map(r=>this.sreg(r)).join(",")
    }
    private isa = (key:string,...regs:number[])=>{
        return tabline(`${key} ${this.seq_regs(...regs)}`); 
    }
    private wisa(key:string,...regs:number[]):void{
        this.write(this.isa(key,...regs))
    }
    private wlinetab(code:any):void{
        this.write(tabline(code));
    }
    //calculate or cmppairing oprands TSIR
    mov = (r1:number,num:number)=> this.write(tabline(`mov ${this.sreg(r1)},${num}`))
    
    movr= (r1:number,r2:number)=> this.wisa('mov',r1,r2)

    add = (r1:number,r2:number,r3:number)=> this.wisa('add',r1,r2,r3)

    sub = (r1:number,r2:number,r3:number)=> this.wisa('sub',r1,r2,r3)
    
    mul = (r1:number,r2:number,r3:number) => this.wisa('mul',r1,r2,r3)
    
    div = (r1:number,r2:number,r3:number) => this.wisa('div',r1,r2,r3)

    mod = (r1:number,r2:number,r3:number)=> this.wisa('mod',r1,r2,r3)
    
    eq = (r1:number,r2:number,r3:number)=> this.wisa('cmp=',r1,r2,r3)
    
    neq = (r1:number,r2:number,r3:number)=> {
        this.eq(r1,r2,r3);
        //create free reg varaible
        const r = this.reg
        this.mov(r,0)
        //r1 == 0 => r2 !=r3 => r1 = 1
        this.eq(r1,r1,r)
    }
    
    lt = (r1:number,r2:number,r3:number)=> this.wisa('cmp<',r1,r2,r3)
    
    gt = (r1:number,r2:number,r3:number)=> this.wisa('cmp>',r1,r2,r3)
    
    lteq = (r1:number,r2:number,r3:number)=> this.wisa('cmp<=',r1,r2,r3)
    
    gteq = (r1:number,r2:number,r3:number)=> this.wisa('cmp>=',r1,r2,r3)
    //jump TSIR
    jmp = (dst:string)=> this.write(tabline(`jmp ${dst}`))
    
    jz  = (r1:number,dst:string) => this.wlinetab(`jz ${this.sreg(r1)},${dst}`)

    jnz = (r1:number,dst:string) => this.wlinetab(`jnz ${this.sreg(r1)},${dst}`)
    
    //
    proc(name: string) {
        this.write(line(`proc ${name}`))
    }

    call = (name: string, ...regs: number[]) => this.wlinetab(`call ${name},${this.seq_regs(...regs)}`);
    
    ret = () => this.wlinetab('ret');
    
    //builtin 
    iget = (r1: number) => this.call("iget",r1);

    iput = (r1: number) => this.call("iput",r1);
    
    mem = (r1: number) => this.call("mem",r1);
    
    rel = (r1: number) => this.call("rel",r1);
    //
    and(r1: number, r2: number, r3: number) {}
    or(r1: number, r2: number, r3: number) {}
    //others
    nop = () => this.wlinetab('ret');
    free_all(...regs: number[]) {
        regs.map(r=>this.rel(r))
    }
}