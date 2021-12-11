import { IToken, LenOne, LenTow, TokenType, TokenTypeError } from '.'
import { TokenError } from './type'

export interface ILexer {
  prev_token(): TokenError
  next_token(): TokenError
}

export interface ILexerAtomata {
  init(): TokenError
  comment_line(): void
  comment_star(): void
  num(): TokenType
  real(): TokenType
  iden(): TokenType
  is_keyword(): boolean
  spec1(): TokenType
  spec2(c1: string): TokenType | false
  spec3(c2: string): TokenType | false
  error5(): TokenTypeError
  error13(): TokenTypeError
}
