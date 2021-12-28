import fs from 'fs'
import { IConfig, path_to_str, _defalut } from './config'
import { Lexer } from './lexer'
import { ILexer } from './types/lexer'
import { IParser } from './types/parser'
import { Parser } from './parser-rd'
import { FD, read_async } from './io'
import { ILogger } from './types'
import { Logger } from './logger'

export interface ICompiler {
  run(): void
}

export class Compiler {
  lexer!: ILexer
  parser!: IParser
  config: IConfig
  logger: ILogger
  fd: FD

  constructor() {
    this.config = _defalut
    this.logger = new Logger(this.lexer, this.config)
    this.fd = -1
  }
  run() {
    //create graph modules
    this.override_conf()
    //start compiler
    this.init()
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
      fd = await read_async(path_to_str(this.config.path))
    } catch (err) {
      console.error(err)
    } finally {
      console.log(fd)
      return fd
    }
  }
  async init() {
    this.fd = await this.load_file()
    this.fd = await this.load_file()
    this.fd = await this.load_file()
    // "The value of 'fd' is out of range. It must be >= 0 && <= 2147483647. Received -1"
    if (this.fd == -1) {
      console.log(`The value of 'fd' is out of range. is negative`)
      process.exit(1)
    }
    // this.lexer = new Lexer(this.fd)
    // this.parser = new Parser(this.lexer, this.config, this.logger)
  }
  //
  pre_compile() {
    //init graph modules
  }
  //
  compile() {
    // this.parser.run()
  }
  //
  post_compile() {}
  private override_conf() {
    this.config.path = this.config.path ?? this.config.default_path
  }
}
