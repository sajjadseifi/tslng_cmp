import { IToken } from '.'
import { LexerError } from './error'

export type Value = string

export type TokenError = IToken | LexerError

export type LenOne = string
export type LenTow = string
