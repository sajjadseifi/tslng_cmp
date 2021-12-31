import path from 'path'
import { ConfigurManagemnt, _defalut } from './config'
import { ILexer } from './types/lexer'
import { Lexer } from './lexer'
import { Parser } from './parser'
import { read_async } from './io'
import { ILogger, ISymbolTable, Nullable } from './types'
import { Logger } from './logger'
import { SymbolTable } from './symbol'
import { ISuggestion, Suggestion } from './suggestion'
import { IModule, Module } from './graph-module'
import {
  AsyncTraversalExcutor,
  Graph,
  IGraph,
  IGraphNode,
  SearchMode,
  TraversalExcutor
} from './lib/graph'
import { FileExtention, IPathTes, Path, PathTes } from './lib/path'
import { zero } from './utils'
import { IParserBase, KeyPME, ParserMode, SubParserTT } from './parser/types'
import { TesParser } from './parser/tes-parser'
import { DefParser } from './parser/def-parser'
import { AssParser } from './parser/ass-parser'
import { HeadeParser } from './parser/head-parser'
export interface ICompiler {
  run(): void
}

export class Compiler {
  gm: IGraph<IModule>
  lexer!: ILexer
  parser!: IParserBase
  congigure: ConfigurManagemnt
  logger: ILogger
  root: ISymbolTable
  suggest: ISuggestion
  tpath: IPathTes
  constructor() {
    this.tpath = new PathTes(_defalut.base_route)
    this.congigure = new ConfigurManagemnt(this.tpath)
    this.logger = new Logger(this.lexer, this.congigure.config)
    this.suggest = new Suggestion(this, this.logger)
    this.root = new SymbolTable()
    this.gm = new Graph(undefined, true)
  }
  async run() {
    //[init configure]
    this.congigure.init()
    //[start compiler]
    this.build()
    this.init_pmes()
    //[pre compiling for founded modules and forward refrencing]
    await this.pre_compile()
    //[parse and then compilation]
    // this.compile()
    //[do some thing after compilation]
    // this.post_compile()
  }
  async load_file(node: IGraphNode<IModule>): Promise<number> {
    let fd = -1
    try {
      const fpath = this.tpath.path_to_str(node.value.path)
      fd = await read_async(fpath)
      const mod = node.value as Module
      mod.set_complex(fd, -1)
    } catch (err) {
      console.error('err', err)
    } finally {
      return fd
    }
  }
  build() {
    const cnf = this.congigure.config
    this.lexer = new Lexer(-1, -1)
    const { lexer: l } = this
    this.logger = new Logger(l, cnf)
    //init parser
    const { logger: lg, suggest: sg, root: r } = this
    this.parser = new Parser(l, cnf, lg, sg, r)
  }
  init_pmes(): void {
    //import pars
    this.parser.new_PME(DefParser, ParserMode.IMP, FileExtention.HTES)
    this.parser.new_PME(DefParser, ParserMode.IMP, FileExtention.TES)
    //pre parsing
    this.parser.new_PME(AssParser, ParserMode.PRE, FileExtention.HTES)
    this.parser.new_PME(TesParser, ParserMode.PRE, FileExtention.TES)
    //parsing
    this.parser.new_PME(HeadeParser, ParserMode.PARSE, FileExtention.HTES)
    this.parser.new_PME(AssParser, ParserMode.PARSE, FileExtention.HTES)
    this.parser.new_PME(TesParser, ParserMode.PARSE, FileExtention.TES)
  }
  parser_switching(modl: IModule): Nullable<SubParserTT> {
    const key: KeyPME = { mod: modl.mode, ext: modl.path.suffix }
    let _SP_: Nullable<SubParserTT> = this.parser.parsers.get(key)
    console.log(_SP_, key)
    return _SP_
  }
  //DFS
  async load_mods_dfs(root: IGraphNode<IModule>): Promise<void> {
    if (root === null) return

    root.visit()
    //load first module
    await this.module_handler(root)

    for (const node of root.children) {
      //Check the node if it was not visited
      if (node.visited) continue
      //search children not visited node
      await this.load_mods_dfs(node)
    }
  }
  //
  async_module_handler: AsyncTraversalExcutor<IModule> = async (node) => {
    if (node.value.is_post) return true
    node.log()
    //opeining a file to start
    if (node.value.is_imp) await this.load_file(node)
    //syncron oprations
    return this.module_handler(node)
  }
  module_handler: TraversalExcutor<IModule> = (node) => {
    //seting node on parser layout for get symbols on childs import node
    this.parser.set_module_node(node)
    //run on mode seleted
    const __SP__ = this.parser_switching(node.value)
    this.parser.execute(__SP__)
    //got to next parser mode
    node.value.next_mode()
    //undset parser
    this.parser.unset_module_node()
    //completing level in lexer
    this.cheack_and_complet(node.value)
    //if parser change mode of def to in_pre need to add new module
    //imports module must grater than zero
    this.importable_path(node)

    return true
  }
  cheack_and_complet(modl: IModule): void {
    //
    if (modl.is_imp) modl.update_complex()
    //
    else if (modl.is_parse && modl.path.is_htes) modl.update_complex()
  }
  importable_path(parrent: IGraphNode<IModule>): void {
    const dir = parrent.value.path.dir
    const imps = this.parser.imports
    const pather = (file_name: string) => {
      return path.normalize(path.join(dir, new Path(file_name).file))
    }
    //change to full path
    this.parser.imports = imps.map((imp) => pather(imp))
    //init if grater then 1
    if (parrent.value.is_imp && !zero(this.parser.imports.length))
      this.init_multi_module(this.parser.imports, parrent)
    //clear imports modules
    if (!zero(this.parser.imports)) this.parser.imports = []
  }
  init_module(path: string, root: Nullable<IGraphNode<IModule>>) {
    const _pth = new Path(path)
    const mod = new Module(_pth)
    const node = this.gm.addT(path, mod, root)
    return node
  }
  init_graph_modules() {
    const { path } = this.congigure.config.app
    const full = this.tpath.path_to_str(path, true)
    const root = this.init_module(full, null)
    return root
  }
  init_multi_module(paths: string[], parent: IGraphNode<IModule>): void {
    paths.forEach((pth) => this.init_module(pth, parent))
  }
  builtin_mod(root: IGraphNode<IModule>) {
    //builtin modules
    const htess = this.tpath.files_in_dir(
      this.congigure.config.def.dir,
      FileExtention.HTES
    )
    //adding define module
    this.init_multi_module(htess, root)
    this.gm.un_visit_all(root!)
  }
  //
  async pre_compile() {
    //TODO init graph modules of buildin/def
    const root = this.init_graph_modules()
    //add buildint modules to graph-module
    this.builtin_mod(root!)
    //[loading all tree file in to graph & then pruning]
    await this.load_mods_dfs(root!)
  }
  //
  compile() {
    //read file
    this.gm.traversal(SearchMode.POST_ORDER, this.module_handler)
  }
  //
  post_compile() {}
  private override_conf() {}
}
