import { Lexer } from './lexer'
import { ILexer } from './types/lexer'
import fs from 'fs'
import { IParser } from './types/parser'
import { Parser } from './parser'
export const main = () => {
  fs.open('./example/2.tes', 'r', (err, fd) => {
    if (err) throw err

    const lex: ILexer = new Lexer(fd)

    const parser: IParser = new Parser(lex)
    parser.run()
  })
}
