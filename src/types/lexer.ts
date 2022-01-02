import { ILexProps, IPosition, TokenType, TokenTypeError } from '.'
import { TokenError } from './type'

export interface ILexer {
  prev_token(): TokenError
  next_token(): TokenError
  follow(counts: number): TokenError[]
  set_fd(plex: ILexProps): void
  clear(): void
  get pos(): IPosition
  get char_index(): number
  get finished(): boolean
}

export interface ILexerAtomata {
  init(): TokenError
  num(): TokenType
  real(): TokenType
  iden(): TokenType
  keyword(): TokenType | null
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
