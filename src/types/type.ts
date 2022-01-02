import { keywords } from '../constants'
import { IToken, TokenType } from '.'
import { ILexerError } from './error'

export type Value = string

export type TokenError = IToken | ILexerError
export type TokenTypeError = TokenType | ILexerError

export type LenOne = string
export type LenTow = string

export type Keyword = keyof typeof keywords

export type FuncType = (...rest: any[]) => any

export interface IRunner {
  run(): void
}
export type Nullable<T> = T | null | undefined

export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
