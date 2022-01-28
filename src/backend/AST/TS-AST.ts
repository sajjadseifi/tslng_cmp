import { AST } from "src/AST/AST";
import * as T3 from "src/AST/TS-IR-Tree";
import { Nullable } from "src/types";

export interface ITSVal{
    base_block?:boolean
    dead_block?:boolean
}
//value
export abstract class TSIRAST extends AST<ITSVal>{
    constructor(private _ast:AST<ITSVal>){
        super();
    }
    abstract prune(parrent:Nullable<TSIRAST>):void;
    live():void{
        this._ast.value!.dead_block  = false
    }
    dead():void{
        this._ast.value!.dead_block  = true
    }
    base():void{
        this._ast.value!.base_block  = true
    }
    base_dead():void{
        this.base();
        this.dead();
    }
} 
export class ProgAST extends TSIRAST {
    constructor(ast:T3.Prog){
        super(ast);
    }
    prune(): void {
        this.childs = AST.uping_LM_child_hood<any>(this);
    }
}
export class ProcAST extends TSIRAST {
    constructor(private ast:T3.Proc){
        super(ast);
    }
    prune(): void {       
        this.childs = AST.uping_LM_child_hood<any>(this.ast.body);
    }
}

export class BodyAST extends TSIRAST {
    constructor(private ast:T3.Body){
        super(ast);
    }
    prune(parrent:Nullable<TSIRAST>): void {  
        //set up list of stmt 
        this.childs = AST.uping_LM_child_hood<any>(this.ast);
        AST.child_to_child_hood_all(parrent);
    }
    
}
export class StmtAST extends TSIRAST {
    
    constructor(private ast:T3.Stmt){
        super(ast);
    }
    prune(parrent:Nullable<TSIRAST>): void {   
        //eliminated child_stmt of parent body and replace sub_stmt
        AST.child_to_child_hood_all(parrent);
    }
}

export class CargAST extends TSIRAST {
    constructor(private ast:T3.Carg){
        super(ast);
    }
    prune(parrent:Nullable<TSIRAST>): void {
        //r,r,....-> (r,(r,(r,(r,c...))))
        this.childs = AST.uping_LM_child_hood<any>(this.ast);
        AST.child_to_child_hood(parrent,this);
    }
}

export class ISAnAST extends TSIRAST {
    constructor(private ast:T3.ISA){
        super(ast);
    }
    prune(parrent:Nullable<TSIRAST>): void {
        //r,sin(n-1)
        if(!(this.ast instanceof T3.ISA2))
            this.childs = AST.uping_LM_child_hood<any>(this.ast);
        else 
            this.childs = this.ast.childs

        AST.child_to_child_hood(parrent,this);
    }
}

export class JumpAST extends TSIRAST{
    constructor(private ast:T3.Jump){
        super(ast);
    }
    prune(parrent: Nullable<TSIRAST>): void {}
}
