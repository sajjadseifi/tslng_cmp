import { line, tabline } from "../utils/stringfy";
import { BIT, BYTE, FO_BLOCK_MEM, MAX_FILE_OPEN, MAX_MEM_CALL_STK, ZERO } from "./alloc";
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
export interface TSAlloc{
    malloc(r0:number):any
    dealloc(r0:number):any
    main(runer:string):any
    get_cell(raddr:number,roffset:number):any
    set_cell(raddr:number,roffset:number,rdata:number):any
    addr_cell(raddr:number,roffset:number):any
}
export class TSIR 
    extends IR 
    implements TSCacl,TSJump,TSBuiltin,TSFunc,
               TSOthrs,TSCaclcmpplcate,TSAlloc
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
    /* Allocating */
    //r0 -> byte size
    malloc  = (r0: number) => this.wisa("malloc",r0);
    //r0 -> refrence of data
    dealloc = (r0: number) => this.wisa("dealloc",r0);
    main(runer:string) {
        let stksize = 8; //stk[0] = end stack
        //frame pointers,stack pointer
        const FOP = BYTE /* FileOpenP 8 */
        const FP  = FOP + BYTE /* FrameP 16 */ 
        const SP  = FP + BYTE /* StackP  24 */
        const FLP = SP + BYTE /* FlushP  32 */
        stksize  += FLP;
        const endP = stksize; /* endP  32 */
        //file open section
        const FOMS = MAX_FILE_OPEN * FO_BLOCK_MEM
        stksize += BYTE /* End Block */
        stksize += FOMS
        //function call
        stksize += BYTE /* EndBlock */
        stksize += MAX_MEM_CALL_STK;

        this.reset_reg()
        const rstk  = this.reg
        const raddr  = this.reg
        const roff  = this.reg
        const rdta  = this.reg
        const rz = this.reg
        const rbit = this.reg
        const rbyte = this.reg
        const rfree = this.reg
        const scal =(addr_reg:number,offset_reg:number,data_reg:number)=> {
            this.movr(roff,offset_reg) 
            this.movr(raddr,addr_reg)
            this.movr(rdta,data_reg)
            this.set_cell(raddr,roff,rdta)   
        }
        
        this.mov(rz,ZERO)
        this.mov(rbit,BIT)
        this.mov(rbyte,BYTE)
    
        //my main
        this.proc("main")
        this.mov(rstk,stksize)
        this.mov(rfree,stksize)
        this.call("memstk",rstk)
        this.add(rfree,rfree,rstk)
        // stk[0] = end block address
        scal(rstk,rz,rfree)
        // stk[index(endP)] = end of FOP block -> ret stored address data
        this.mov(roff,endP/BYTE)
        this.mov(rdta,endP + FOMS)
        scal(rstk,roff,rdta)
        // rfree = raddr =  addr of cell #FOP
        this.movr(rfree,raddr)
        /* start block of Call Stack Function */
        //stk[index(FP)] = start addr
        this.mov(roff,FP/BYTE)
        scal(rstk,roff,raddr)
        //stk[index(SP)] = start addr
        this.mov(roff,SP/BYTE)
        scal(rstk,roff,raddr)
        //stk[index(SP)] = start addr
        this.mov(roff,FLP/BYTE)
        scal(rstk,roff,raddr)
        // stk[1] = pointer of cell #FOP
        this.mov(roff,FOP/BYTE)
        scal(rstk,roff,rfree)
        //app main
        this.call(runer)
        this.ret()
    }
    get_cell=(raddr:number,roffset:number) =>this.call("get_cell",raddr,roffset)

    set_cell=(raddr:number,roffset:number,rdata:number)=>this.call("set_cell",raddr,roffset,rdata)
    
    addr_cell=(raddr:number,roffset:number)=>this.call("addr_cell",raddr,roffset)
    /*
        proc addr_cel #r0->addr,r1->offset(block/8)
            mov r3,8
            add r1,r1,r3  # index * 8
            add r0,r0,r1  # cell address
            ret

        proc set_cell #r0->addr,r1->offset(block/8),r2->data 
            call addr_cel,r0,r1
            st r2,r0      # store data
            mov r0,r1     # stored address data
            ret

        proc get_cell #r0->addr,r1->offset(block/8) 
            call addr_cel,r0,r1
            ld r0,r0      # load data
            ret
    */

}
