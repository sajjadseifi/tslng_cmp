import { AST } from "src/AST/AST";
import * as T3 from "src/AST/TS-IR-Tree";
import { Nullable } from "src/types";
import { Caster } from "src/types/caster";
import { BodyAST, CargAST, ISAnAST, ITSVal, ProcAST, ProgAST, StmtAST, TSIRAST } from "../AST/TS-AST";
import { IBuilderAST } from "../lib/builder";

export class AstIRBuilder extends IBuilderAST<AST<ITSVal>,Nullable<TSIRAST>>{
    init(): void {
        this.ircst = new Caster()
        this.ircst.put(T3.Prog,ProgAST);
        this.ircst.put(T3.Proc,ProcAST);
        this.ircst.put(T3.Body,BodyAST);
        this.ircst.put(T3.Stmt,StmtAST);
        this.ircst.put(T3.Call,CargAST);
        this.ircst.put(T3.Carg,CargAST);
        this.ircst.put(T3.ISA2,ISAnAST);
        this.ircst.put(T3.ISA3,ISAnAST);
    }
    //trim each root knot deeply
    build(ast:AST<ITSVal>,parrent:Nullable<TSIRAST>) {
        if(!this.ircst) {
            console.log("pleas first build map");
            return null
        }
        const ttast = this.ircst.instance(ast) as Nullable<TSIRAST>;
        
        if(!ttast) return null;
        
        // first prune root
        ttast.prune(parrent)
        //seocnd re build of ast
        ttast.childs.forEach((tc)=>this.build(tc,ttast))

        return ttast
    }
}