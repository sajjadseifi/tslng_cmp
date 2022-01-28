import { AST } from "./AST";
//ts ast val

//root
export abstract class TIT extends AST<any>{
    abstract gencode():string;
}

export class Prog extends TIT {
    gencode(): string {
        throw new Error("Method not implemented.");
    }
}

export class Prog1 extends Prog {
}

export class Prog2 extends Prog {
    constructor(public proc :Proc,public  prog:Prog){
        super(proc,prog);
    }
}

export class Proc extends TIT {
    gencode(): string {
        throw new Error("Method not implemented.");
    }
    constructor(public iden:Iden,public body:Body){
        super(iden,body);
    }
}

export class Body extends TIT {
    gencode(): string {
        throw new Error("Method not implemented.");
    }
}

export class Body1 extends Body {
    constructor(){
        super();
    }
}
export class Body2 extends Body {
    constructor(stmts:Stmt,body:Body){
        super(stmts,body);
    }
}
export class Stmt extends TIT {
    gencode(): string {
        throw new Error("Method not implemented.");
    }
}
/* stmt Rules */ 

export class MovReg extends Stmt{
    constructor(public reg0:Reg,public reg1:Reg){
        super(reg0,reg1);
    }
}
export class MovNum extends Stmt{
    constructor(public reg:Reg,public num:Num){
        super(reg,num);
    }
}
export class Call extends Stmt{
    constructor(public carg:Carg){
        super(carg);
    }
}
export class Load extends Stmt{
    constructor(public isa2:ISA2){
        super(isa2);
    }
}
export class Store extends Stmt{
    constructor(public isa2:ISA2){
        super(isa2);
    }
}

/* add | sub */ 
export class Add extends Stmt{
    constructor(public isa3:ISA3){
        super(isa3);
    }
}

/* mul | div | mod  */ 
export class Mul extends Stmt{
    constructor(public isa3:ISA3){
        super(isa3);
    }
}
export class Ret extends Stmt{
    constructor(){
        super();
    }
}

/* call arg Rules */
export class Carg  extends TIT{
    gencode(): string {
        throw new Error("Method not implemented.");
    }
    
} 
export class Carg1 extends Carg {
    constructor(){
        super();
    }
}

export class Carg2 extends Carg {
    constructor(public reg:Reg){
        super(reg);
    }
}
export class Carg3 extends Carg {
    constructor(public reg:Reg,public carg:Carg){
        super(reg,carg);
    }
}
export class ISA extends TIT{
    gencode(): string {
        throw new Error("Method not implemented.");
    }
}

export class ISA2 extends ISA{
    constructor(public r1:Reg,public r2:Reg){
        super(r1,r2);
    }
}
export class ISA3 extends ISA{
    constructor(public isa2:ISA2,public rn:Reg){
        super(isa2,rn);
    }
}
export abstract class Jump extends TIT{
    
    constructor(public label:string,public type:number){
        super();
    }
    gencode(): string {
        throw new Error("Method not implemented.");
    }
}

export class Jmp extends Jump{
    constructor(label:Lable){
        super(label.name,0);
    } 
}
export type JXZType = "jz" | "jnz"

export class JxZ extends Jump{
    constructor(public code:JXZType,public reg:Reg,label:Lable){
        super(label.name,1);
    } 
}

export class Lable extends TIT{
    constructor(public name:string){
        super()
    }
    gencode(): string {
        throw new Error("Method not implemented.");
    }
}

export class Iden extends TIT{
    gencode(): string {
        throw new Error("Method not implemented.");
    }
    constructor(public name:string){
        super();
    }
}

export class Reg extends TIT {
    gencode(): string {
        throw new Error("Method not implemented.");
    }
    constructor(public reg:number){
        super();
    }
}

export class Num extends TIT {
    gencode(): string {
        throw new Error("Method not implemented.");
    }
    constructor(public num:number){
        super();
    }
}