import { line, tab } from '../utils/stringfy';
import { FD, write } from "../io";
interface IIR{
    can_work?:boolean
    get label() : number;
    get reg() : number;
    slabel(lab:number) :string;
    sreg(reg:number) : string;
    set_tsfd(tsfd:number):void;
    reset_reg():void
}
export abstract class IR implements IIR{
    private lab_c:number
    private reg_c:number
    private en:boolean
    constructor(public fd:FD){
        this.reg_c = 0;
        this.lab_c = 0;
        this.en = true;
    }
    disabled():void{
        this.en = false;
    }
    enabled():void{
        this.en = true;
    }
    reset_reg(c:number=0):void{
        this.reg_c = c;
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
        return "L" + lab; 
    }
    sreg(reg:number) : string{
        return "r" + reg; 
    }
    write(code:string){
        if(!this.en || this.fd == -1) return

        write(this.fd,code);
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