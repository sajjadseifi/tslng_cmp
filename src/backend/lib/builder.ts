import { Nullable } from "src/types"
import { Caster } from "src/types/caster"

export abstract class  IBuilderAST<T,U>{
    ircst?:Caster<any,any>
    
    abstract init(): void;
    
    abstract build(d:T,p:U): U;
    
    clear():void{
        this.ircst = undefined
    }

}