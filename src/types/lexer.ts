import { IToken } from '.'
import { IPosition } from '.'
import { LexerError } from './error'

export interface ILex {
  src: string
  chars: string
  current_pos: IPosition
  get_char(): string
  un_get_char(): string
  clear_chars(): void
}

export interface ILexer {
  prev_token(): IToken | never
  next_token(): IToken | never
}

export interface ILexerAtomata {
  init(): IToken | LexerError
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
