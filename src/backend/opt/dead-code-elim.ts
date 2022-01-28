import { AST } from "src/AST/AST";
import { Jump, Lable, Ret } from "src/AST/TS-IR-Tree";
import { Graph, GraphNode, IGraphNode, SearchMode, TraversalExcutor } from "src/lib/graph";
import { Nullable } from "src/types";
import * as TAST from "../AST/TS-AST";

export type TSFull = TAST.TSIRAST |  AST<TAST.ITSVal>

export type FuncTSFull = (ast:TSFull,parrent:TSFull) => void

export type FuncControlFllow = (
    ast:TSFull,
    parrent:Nullable<TSFull>,
    gctlflow:Graph<TSFull>,
    pnode:Nullable<IGraphNode<TSFull>>
) => Nullable<IGraphNode<TSFull>>

export type FnewNode = (index:number,parrent:TSFull)=>IGraphNode<TSFull>

export let labls :TSFull[]= []

export const execute = (ast: TSFull) => {
    const gctlflow = new Graph<TSFull>(undefined,true)
    prog(ast,null,gctlflow,null)
}

export const prog :FuncControlFllow = (ast,parrent,gctlflow) => {
    base_dead(ast);
    ast.childs.forEach(ch=>proc(ch,ast,gctlflow,new_node(-1,parrent!)))

    return null
}

export const proc :FuncControlFllow =(ast,parrent,gctlflow,gpnode) => {
    //first child block
    let last_block;
    //load all function for use control flow
    labls = []
    //new body function code 
    if(ast.childs.length ==0)
        return
    //add first segemnt stmt
    base_dead(ast);
    gctlflow.add(new_node(0,parrent!),gpnode)
    last_block = gctlflow.add(new_node(0,parrent!),gpnode)

    //map stmts
    for (let i=1;i<ast.childs.length;i++){
        last_block = 
                stmt(ast.childs[i],ast,gctlflow,last_block) 
                ?? last_block
    }
    //living block
    gctlflow.traversal(SearchMode.DFS,resurrection_jesus_christ)
    //dead code eliminated
    burying_corpse_code(ast)

    return null
}

export const stmt  :FuncControlFllow =(ast,parrent,gctlflow,gpnode) => {
    return(
        jump(ast,parrent,gctlflow,gpnode)  ||
        label(ast,parrent,gctlflow,gpnode) ||
        ret(ast,parrent,gctlflow,gpnode)
    )
}

export const jump :FuncControlFllow =(ast,parrent,gctlflow,gpnode)=>{
    if(!is_jump(ast)) return null
    base_dead(ast);
    const index = parrent!.child_index(ast)
    const j = gctlflow.add(new_node(index ,parrent!),gpnode)
    if(index ==-1) return null

    const lab = (ast as Jump).label
    const svdlbind = labls.findIndex(l=>(l as Lable).name == lab)
    const labj_index = parrent!.child_index(labls[svdlbind])
    const labj = new_node(labj_index,parrent!)
    //is dead code
    base_dead(parrent!.childs[labj_index])
    gctlflow.add(labj,j)
    
    if((ast as Jump).type == 0 || index + 1 == parrent!.childs.length) return j

    const nxtj = new_node(index + 1,parrent!)
   
    base_dead(parrent!.childs[index + 1])
    gctlflow.add(nxtj,j)

    return j
}
export const label :FuncControlFllow=(ast)=>{
    if(is_label(ast))  labls.push(ast);
    return null
}
export const ret:FuncControlFllow =(ast,parrent,gctlflow,gpnode)=>{   
    if(!is_ret(ast)) return null
    ast.value!.base_block= true
    const index = parrent!.child_index(ast)
    return gctlflow.add(new_node(index ,parrent!),gpnode)
}
export const new_node:FnewNode =(index:number,parrent)=> {
    return new GraphNode(index,parrent)
}
export const base_dead=(ast:TSFull)=>{
    ast.value!.base_block= true
    ast.value!.dead_block= true
}
export const reset_block=(ast:TSFull)=>{
    ast.value!.base_block= false
    ast.value!.dead_block= false
}
export const is_jump=(ast:TSFull)=> ast instanceof  Jump

export const is_label=(ast:TSFull)=> ast instanceof Lable

export const is_ret=(ast:TSFull)=> ast instanceof Ret

const resurrection_jesus_christ :TraversalExcutor<TSFull> = (node)=>{
    node.value.value!.dead_block = false
    return true
}
const burying_corpse_code = (parrent:TSFull)=>{
    const new_code = []

    for (let i=0; i<parrent.childs.length;) {
        //if this code is not dead
        if(parrent.childs[i].value?.dead_block == false){
            new_code.push(parrent.childs[i])
            i++;
        }
        else{
            i++;
            //skip to find new block scop
            while(i < parrent.childs.length && parrent.childs[i].value?.base_block == false) i++;
        }
        
    }
    
    new_code.forEach(c=>reset_block(c))
    
    parrent.childs = new_code
}