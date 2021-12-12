import { IToken, LenOne, LenTow, TokenType, TokenTypeError } from '.'
import { TokenError } from './type'

export interface ILexer {
  finished: boolean
  prev_token(): TokenError
  next_token(): TokenError
}

export interface ILexerAtomata {
  is_keyword(): boolean
  init(): TokenError
  num(): TokenType
  real(): TokenType
  iden(): TokenType
  str(): TokenTypeError | null
  str_single_cahr(): TokenTypeError
  str_linear(): TokenTypeError
  str_big_string(): TokenTypeError
  skiper_signle_char(): void
  spec1(): TokenTypeError
  spec2(): TokenType
  spec3(): TokenType
  error5(): TokenTypeError
  error13(): TokenTypeError
  comment_line(): void
  comment_star(): void
}
