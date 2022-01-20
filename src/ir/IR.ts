import { line, tab } from '../utils/stringfy';
import { FD, write } from "../io";
interface IIR{
    can_work?:boolean
    get label() : number;
    get reg() : number;
    slabel(lab:number) :string;
    sreg(reg:number) : string;
    set_tsfd(tsfd:number):void;
}
export abstract class IR implements IIR{
    private lab_c:number
    private reg_c:number
    constructor(public fd:FD){
        this.reg_c = 1;
        this.lab_c = 1;
    }
    
    get label() : number{
        return this.lab_c++; 
    }
    get reg() : number{
        return  this.reg_c++; 
    }
    set_tsfd(tsfd:number){
        this.fd = tsfd
    }
    slabel(lab:number) : string{
        return "lab" + lab; 
    }
    sreg(reg:number) : string{
        return "r" + reg; 
    }
    write(code:string){
        if(this.fd != -1) write(this.fd,code);
    }
    nwrite(code:string){
        this.write(line(code));
    }
    twrite(code:string){
        this.write(tab(code));
    }
    ntwrite(code:string){
        this.write(line(tab(code)));
    }
}