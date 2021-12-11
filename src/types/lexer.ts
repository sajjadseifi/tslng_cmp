import { IToken } from '.'

import { IPosition } from '.'

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
}
