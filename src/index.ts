import { Lex } from './lex'
import { Lexer } from './lexer'
import { Token } from './token'
import { TokenError, TokenType } from './types'
import { ILexer } from './types/lexer'

const main = () => {
  console.log('start main')

  const lex: ILexer = new Lexer(`
  
    function sajjad() returns Int:
      --is now comment comments
      val sajjad : Int = 10;
      if(sajjad == 10)
        sajjad = 50;
    end
  `)
  let tok: TokenError

  while (!lex.finished) {
    const tok: TokenError = lex.next_token()
    console.log(tok)
  }
  console.log('end main')
}

main()
