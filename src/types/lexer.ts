import { IToken } from '.'
import { IPosition } from '.'
import { LexerError } from './error'

export interface ILex {
  src: string
  current_pos: IPosition
  get_char(): string
  un_get_char(): string
}

export interface ILexer {
  next_token(): IToken
}

export interface ILexerAtomata {
  init(): void
  num(): IToken
  real(): IToken
  iden(): IToken
  keyword(): IToken
  spec1(): IToken
  spec2(c1: string): IToken
  spec3(c2: string): IToken
  error5(): LexerError
  error13(): LexerError
}
