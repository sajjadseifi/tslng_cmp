import fs from 'fs'
import { ConfigurManagemnt, _defalut } from './config'
import { ILexer } from './types/lexer'
import { IParser } from './types/parser'
import { Lexer } from './lexer'
import { Parser } from './parser'
import { FD, read_async } from './io'
import { ILogger, ISymbolTable } from './types'
import { Logger } from './logger'
import { SymbolTable } from './symbol'
import { PreParser } from './post-parser'
import { PostParser } from './pre-pareser'
import { sym } from './constants'
import * as utils from './utils'

export interface ICompiler {
  run(): void
}

export class Compiler {
  lexer!: ILexer
  parser!: IParser
  congigure: ConfigurManagemnt
  logger: ILogger
  fd: FD
  root: ISymbolTable
  constructor() {
    this.congigure = new ConfigurManagemnt()
    this.logger = new Logger(this.lexer, this.congigure.config)
    this.fd = -1

    this.root = new SymbolTable()
  }
  async run() {
    //init configure
    this.congigure.init()
    //start compiler
    await this.init()
    //pre compiling for founded modules and forward refrencing
    this.pre_compile()
    //parse and then compilation
    this.compile()
    //do some thing after compilation
    this.post_compile()
  }
  async load_file(): Promise<number> {
    let fd = -1
    try {
      fd = await read_async(this.congigure.app_path)
    } catch (err) {
      console.error(err)
    } finally {
      // console.log(fd)
      return fd
    }
  }
  async init() {
    this.fd = await this.load_file()
    // "The value of 'fd' is out of range. It must be >= 0 && <= 2147483647. Received -1"
    if (utils.eq(this.fd, -1)) {
      console.log(`The value of 'fd' is out of range. is negative`)
      process.exit(1)
    }
    this.lexer = new Lexer(this.fd, 0)
    this.logger = new Logger(this.lexer, this.congigure.config)
    this.parser = new Parser(
      this.lexer, //
      this.congigure.config, //
      this.logger //
    )
  }
  //

  //
  pre_compile() {
    //TODO init graph modules of buildin/def

    //TODO add builtin to symbol
    //built in functions
    const tbl = this.parser.root
    tbl.builtin('getInt', sym.INT)
    tbl.builtin('printInt', sym.NIL, ['n'], [sym.INT])
    tbl.builtin('createArray', sym.ARRAY, ['n'], [sym.INT])
    tbl.builtin('arrayLength', sym.INT, ['n'], [sym.INT])
    tbl.builtin('arrayLength', sym.NIL, ['n'], [sym.INT])
    tbl.used_all()
    //TODO init graph modules of dir

    //TODO pre parser (forward refrencing,)
    new PreParser(this.parser as Parser).run()
  }
  //
  compile() {
    this.parser.run()
  }
  //
  post_compile() {
    new PostParser(this.parser as Parser).run()
  }
  private override_conf() {}
}
