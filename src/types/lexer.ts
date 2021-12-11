import { IToken, LenOne, LenTow } from '.'
import { TokenError } from './type'

export interface ILexer {
  prev_token(): TokenError
  next_token(): TokenError
}

export interface ILexerAtomata {
  init(): TokenError
  comment_line(): IToken
  comment_star(): IToken
  num(): IToken
  real(): IToken
  iden(): IToken
  keyword(): IToken
  spec1(): IToken
  spec2(c1: LenOne): IToken
  spec3(c2: LenTow): IToken
  error5(): TokenError
  error13(): TokenError
}
