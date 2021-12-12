import { keywords } from '@src/constants'
import { IToken, TokenType } from '.'
import { ILexerError } from './error'

export type Value = string

export type TokenError = IToken | ILexerError
export type TokenTypeError = TokenType | ILexerError

export type LenOne = string
export type LenTow = string

export type Keyword = keyof typeof keywords
