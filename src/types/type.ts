import { IToken, TokenType } from '.'
import { LexerError } from './error'

export type Value = string

export type TokenError = IToken | LexerError
export type TokenTypeError = TokenType | LexerError

export type LenOne = string
export type LenTow = string
