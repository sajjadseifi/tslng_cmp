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
import { IParserBase, strble_mode_parse } from './parser/types'
import colors from 'colors'
import { IParserGenerator, ParserGenerator } from './parser-generator'
export interface ICompiler {
  run(): void
}
export interface SharedCompier {
  parser: IParserBase
}

const { POST_ORDER } = SearchMode
export class Compiler implements ICompiler, SharedCompier {
  gm: IGraph<IModule>
  lexer!: ILexer
  parser!: IParserBase
  logger!: ILogger
  congigure: ConfigurManagemnt
  root: ISymbolTable
  suggest!: ISuggestion
  tpath: IPathTes
  private completed_mods: number
  private switcher: IParserGenerator
  constructor() {
    this.completed_mods = 0
    this.tpath = new PathTes(_defalut.base_route)
    this.congigure = new ConfigurManagemnt(this.tpath)
    this.root = new SymbolTable()
    this.gm = new Graph(undefined, true)
    this.switcher = new ParserGenerator(this)
  }
  add_to_complet() {
    this.completed_mods++
  }
  async run() {
    //[init configure]
    this.congigure.init()
    //[start compiler]
    this.build()
    //parser mode extention [switcher]
    this.switcher.build()
    //[pre compiling for founded modules and forward refrencing]
    await this.pre_compile()
    //[parse and then compilation]
    this.compile()
    //[do some thing after compilation]
    // this.post_compile()
  }
  async load_file_node(node: IGraphNode<IModule>): Promise<number> {
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
    //Lexer
    this.lexer = new Lexer(-1, -1)
    const { lexer: l, tpath: t } = this
    //Loger
    this.logger = new Logger(l, cnf, t)
    const { logger: lg } = this
    //Suggestion
    this.suggest = new Suggestion(this, lg)
    //Parser
    const { suggest: sg, root: r } = this
    this.parser = new Parser(l, cnf, lg, sg, r, false)
  }
  //DFS
  async load_mods_dfs(root: IGraphNode<IModule>): Promise<void> {
    if (root === null) return

    root.visit()
    //load first module
    await this.async_module_handler(root)

    for (const node of root.children) {
      //Check the node if it was not visited
      if (node.visited) continue
      //search children not visited node
      await this.load_mods_dfs(node)
    }
  }
  post_order_mod(root: IGraphNode<IModule>): void {
    if (root === null) return

    root.visit()
    for (const node of root.children) {
      //Check the node if it was not visited
      if (node.visited) continue
      //search children not visited node
      this.post_order_mod(node)
    }
    //re parsing
    this.module_handler(root)
    //un visit node
    root.un_visit()
  }
  //
  async_module_handler: AsyncTraversalExcutor<IModule> = async (node) => {
    //opeining a file to start
    if (node.value.is_start) await this.load_file_node(node)
    //syncron oprations
    return this.module_handler(node)
  }
  module_handler: TraversalExcutor<IModule> = (node) => {
    if (node.value.is_finished) return true
    //completing level in lexer
    this.cheack_and_complet(node)
    //seting node on parser layout for get symbols on childs import node
    this.parser.set_module_node(node)
    //run on mode seleted
    this.switcher.switching(node)
    console.log(colors.green(`:: ${strble_mode_parse[node.value.mode]} ::`))
    node.log()
    const SPT = this.switcher.parser
    const SP = SPT ? new SPT(this) : undefined
    this.parser.execute(SP)
    //resposne after parser executatuon
    this.checking_after_mode_travel(node)
    //undset parser
    this.parser.unset_module_node()
    //if parser change mode of def to in_pre need to add new module
    //imports module must grater than zero
    this.importable_path(node)
    //true for travel next node
    return true
  }
  cheack_and_complet(node: IGraphNode<IModule>): void {
    if (node.value.is_start) {
      node.value.update_plex()
    } else if (node.value.is_imp || node.value.is_finished) {
      node.value.update_complex()
    }
  }
  checking_after_mode_travel(node: IGraphNode<IModule>): void {
    //if is parse mode loged suggestion
    // console.log(node.value.is_pre)
    // if (node.value.is_pre) {
    //   //root not used function decleared
    //   this.suggest.declared_and_not_used(node)
    //   // if (!this.parser.can_run) {
    //   //   this.parser.logger.not_found_start_func()
    //   // }
    // }
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
    //pre or parsing file
    this.gm.un_visit_all(this.gm.root!)
    // this.post_order_mod(this.gm.root!)
    while (true) {
      console.log({
        cm: this.completed_mods,
        glen: this.gm.len
      })

      if (this.completed_mods >= this.gm.len) break

      this.gm.traversal(POST_ORDER, this.module_handler)
    }
  }
  //
  post_compile() {}
  private override_conf() {}
}
