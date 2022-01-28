import { Nullable } from "src/types";

export abstract class AST<T>{
    childs:AST<T>[]
    public value?:T
    constructor(...childs:AST<T>[]){
        this.childs = childs;
    }
    child_index(child:AST<T>):number{
        return this.childs.findIndex(ch=>ch == child)
    }
    //Left Most child hood
    static uping_LM_child_hood<T>(root:AST<T>,):AST<T>[]{
        //return null 
        if(root.childs.length == 0) return []
        //return left side
        const left  = root.childs[0];
        if(root.childs.length == 1) return [left]
        //get sub set of left most driven childs nested
        const subset = this.uping_LM_child_hood(root.childs[1])
        //
        return [left,...subset]
    }
    //prev value
    static child_to_child_hood_all<T>(root:Nullable<AST<T>>):AST<T>[]{
        if(!root) return []
        const prev =  [...root.childs]
        let new_childs : AST<T>[] = []
        
        for (const ch of prev) {
            if(ch.childs.length == 0)
                new_childs.push(ch)
            else
            new_childs = [...new_childs,...ch.childs]
        }
        
        root.childs = new_childs

        return prev
    }
    //return prev childs
    static child_to_child_hood<T>(root:Nullable<AST<T>>,child:Nullable<AST<T>>):AST<T>[]{
        if(!root || !child) return []
        const index = root.child_index(child);
        
        if(index == -1) return []

        const prev =  [...root.childs]
        let new_childs :AST<T>[]= []
        
        for (let i=0;i<root.childs.length;i++){
            new_childs = [
                ...new_childs,...(
                    i == index ? root.childs : [
                    root.childs[i]
                    ]
                )
            ] 
        }

        return prev
    }
    add_child(ch:AST<T>){
        this.childs.push(ch);
    }
    
    rm_child(child:AST<T>){
        this.childs=this.childs.filter(ch=>ch == child);
    }
    dfs(fc:()=>{}){
        fc();
        this.childs.map(ch=>ch.dfs(fc))
    }
    tostring():string{
        return this.tostring()
    }
    set_val(value:T):void{
        this.value= value
    }
    // abstract execute():any;
}
