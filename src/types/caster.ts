import { Nullable } from "src/types";
import { Class, Constructor } from "./type";

export type CAST = new (arg:any) => any;


export class Caster<V extends Class<T>,T extends Constructor<T>> { 
    private casttbl:Map<V,T>
    constructor(){
        this.casttbl = new Map<V,T>()
    }
    put(ast:V,instanceable:T):void{
        this.casttbl.set(ast,instanceable)
    }
    exist(ast:V):boolean{
        return this.casttbl.has(ast)   
    }
    get(ast:V):T{
        return this.casttbl.get(ast) as T
    }
    instance(ast:V):Nullable<T>{
        let CNST: any;

        this.casttbl.forEach((TT:T,K:V)=>{
            if(!CNST && ast instanceof K)
                CNST = TT                        
        })

        return new CNST(ast) as T
    }
}