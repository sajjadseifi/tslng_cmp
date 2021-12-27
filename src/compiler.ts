import { IConfig, _defalut } from './config'
import { Lexer } from './lexer'
import { ILexer } from './types/lexer'
import { IParser } from './types/parser'
import fs from 'fs'
import { Parser } from './parser-rd'
export interface ICompiler {
  run(): void
}

export class Compiler {
  lexer!: ILexer
  parser!: IParser
  config: IConfig
  constructor() {
    this.config = _defalut
  }
  run() {
    //create graph modules
    this.override_conf()
    //start compiler
    this.init()
  }
  init() {
    fs.open('./example/2.tes', 'r', (err, fd) => {
      if (err) throw err

      this.lexer = new Lexer(fd)

      const parser: IParser = new Parser(this.lexer, this.config)
      parser.run()
    })
  }
  private override_conf() {
    this.config.path = this.config.path ?? this.config.default_path
  }
}
