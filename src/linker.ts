import { IModule } from "./graph-module";
import { append_file_to_file, create_file_or_clear } from "./io";
import { IGraph, SearchMode, TraversalExcutor } from "./lib/graph";
import { IPath, IPathTes } from "./lib/path";

export interface ILinkerIR{
    build():void
}


export class LinkerIR {
    private foutfd:number
    constructor(public tpath:IPathTes,public out_path:IPath,public grap_modules:IGraph<IModule>){
        this.foutfd = -1
    }

    async build(){
        const faddr = this.tpath.path_to_str(this.out_path);
        this.foutfd = await create_file_or_clear(faddr)
        
        this.grap_modules.traversal(SearchMode.POST_ORDER,this.appending)   
    }

    appending: TraversalExcutor<IModule> = (node) => {
        //append *.ts to  out
        //tsfd -> foutfd
        append_file_to_file(node.value.tsfd,this.foutfd)
        return true
    }
}