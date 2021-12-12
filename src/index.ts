import { LexicalError } from './error'
import { Lex } from './lex'
import { Lexer } from './lexer'
import { Token } from './token'
import { TokenError, TokenType } from './types'
import { ILexer } from './types/lexer'
import fs from 'fs'
const main = () => {
  console.log('start main')

  fs.open('./example/1.tes', 'r', (err, fd) => {
    if (err) throw err

    const lex: ILexer = new Lexer(fd)
    while (!lex.finished) {
      const tok: TokenError = lex.next_token()
      console.log(tok)
    }
  })

  console.log('end main')
}

main()
