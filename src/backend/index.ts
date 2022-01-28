import { AstIRBuilder } from "./builder/ast-ir.builder"
import { ir_ptree } from "./parser-irtree"

export const run =()=>{
    const ptre = ir_ptree()
    const bldr = new AstIRBuilder()
    bldr.init()
    const irast = bldr.build(ptre,null)
    bldr.clear()

    if(!irast) return

} 