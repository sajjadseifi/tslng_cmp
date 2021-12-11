import { IToken } from '.'
import { LexerError } from './error'

export interface ILexer {
  prev_token(): IToken | never
  next_token(): IToken | never
}

export interface ILexerAtomata {
  init(): IToken | LexerError
  comment_line(): IToken
  comment_star(): IToken
  num(): IToken
  real(): IToken
  iden(): IToken
  keyword(): IToken
  spec1(): IToken
  spec2(): IToken
  spec3(): IToken
  error5(): LexerError
  error13(): LexerError
}
