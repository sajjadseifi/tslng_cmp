class Symbols{
    name
    type
    func
    args

    list_symbols
    constructor(){
        this.list = []
    }
    put(name,type,func,args){}
    del(name){}
    get(name){}
    exist(name){}
}
class Compiler{
    root
    constructor()
    {
        this.root = new SymbolTable();   
    }   

    prog(){
        if(this.func())
            this.prog()
    }
    func(){
        
        let token = null
        //next token
        if(token != "function")
            throw new Error("expect function")
        
        //get function name 
        let func_name = this.iden()
        if(func_name == null)
            throw new Error("expect identifier")
        
        //next token
        if(token != "(")
            throw new Error("expect (")
        
        //return number of args
        const param_count = this.flist();
        
        //next token
        if(token != "returns")
            throw new Error("expect returns")
        //get type
        let ret_type = this.type()
        if(ret_type == null)
             throw new Error("expect return type")
        
        this.root.put(func_name,ret_type,true,param_count);

        //next token
        if(token != ":")
             throw new Error("expect :")
   
        this.body();

        //next token
        if(token != "end")
            throw new Error("expect end")

        return true
    }
    body(){
        if(this.stmt()){
            this.body();
        }
    }
    stmt(){
        let token = null
        //next token

        switch(token)
        {
            case "if":
                //if stamenet

                //next token without drop
                //check can be else stamtment
                break
            case "while":
                //while stamenet
                break
            case "foreach":
                //foreach stamenet
                break
            case ":":
                //start body
                this.body();
                //next token
                token = null
                if(token != "end")
                    throw new Error("expect end")
                break
            }
    }
    //must resolve ambiguity
    expr(){}

    flist(){
        let token = null
        //next token
        if(token == ")")
            return 0

        let arg_type = this.type()
        if(arg_type == null)
            throw new Error("expect return type")

        let arg_name = this.type()
        if(type == null)
            throw new Error("expect return type")

        this.root.put(arg_name,arg_type);

        token = null
        //next token

        if(token == ",")
            return 1 + this.flist()
        
        return 1
    }
    clist(){    
        let token = null
        //next token
        if(token == ")")
            return 0

        this.expr();

        //next token

        if(token == ",")
            return 1 + this.clist()
        
        return 1    
    }
    iden(){
        let token = null
        //next token
        //check token iden 
        
        //if iden return token

        //else return null
    }
    type(){}
    num(){
        //next token
        //check token type
        
        //if type return token

        //else return null
    }
}