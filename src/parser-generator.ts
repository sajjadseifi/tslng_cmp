import { Compiler } from './compiler'
import { IModule } from './graph-module'
import { IGraphNode } from './lib/graph'
import { FileExtention } from './lib/path'
import { DefParser } from './parser/def-parser'
import { HeadeParser } from './parser/head-parser'
import { PME } from './parser/PME'
import { TesParser } from './parser/tes-parser'
import { IPME, KeyPME, ParserMode, SubParserTT } from './parser/types'
import { Nullable } from './types'

export interface IParserGenerator {
  get parser(): Nullable<SubParserTT>
  build(): void
  switching(node: IGraphNode<IModule>): void
}
const { FINISHED, IMP, PARSE, POST, PRE, SRART } = ParserMode
const { HTES, TES } = FileExtention

export class ParserGenerator implements IParserGenerator {
  private _parser: Nullable<SubParserTT>
  private parsers: PME

  constructor(public compiler: Compiler) {
    this.parsers = new PME()
  }
  get parser(): Nullable<SubParserTT> {
    return this._parser
  }
  build(): void {
    //import pars
    this.parsers.set(DefParser, IMP, HTES, true)
    this.parsers.set(DefParser, IMP, TES, true)
    //pre parsing
    // this.parser.new_PME(AssParser, ParserMode.PRE, FileExtention.HTES)
    this.parsers.set(TesParser, PRE, TES, {
      log: { syntax: true, error: true }
    })
    //parsing
    this.parsers.set(HeadeParser, PARSE, HTES, true)
    // this.parser.new_PME(AssParser, ParserMode.PARSE, FileExtention.HTES)
    this.parsers.set(TesParser, PARSE, TES, {
      log: {
        semantic: true,
        warning: true,
        error: true
      },
      suggest: true
    })
  }
  switching(node: IGraphNode<IModule>): void {
    let key: Nullable<KeyPME>

    //got to next parser mode
    let pem: Nullable<IPME> = null
    while (!node.value.is_finished) {
      //got to next parser mode
      node.value.next_mode()
      //add completed modules
      if (node.value.is_finished) {
        this.compiler.add_to_complet()
      }
      //get SubParser type
      key = {
        mod: node.value.mode, //
        ext: node.value.path.suffix
      }
      pem = this.parsers.get(key)
      //out in while if exsit
      if (pem) break
    }

    this.set_statuses(pem)
    this.set_parser(pem)
  }
  private set_statuses(pem: Nullable<IPME>): void {
    this.compiler.logger.set_loging_status(pem?.stuses?.log)
    this.compiler.suggest.set_sug_status(pem?.stuses?.suggest)
  }
  private set_parser(pem: Nullable<IPME>): void {
    this._parser = pem?.parser
  }
}
