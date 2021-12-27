import { typedef, keywords, patterns } from '../constants'
import { IToken, TokenType } from '../types'

export const is_num = (token: IToken) => token.type === TokenType.TOKEN_NUMBER

export const is_alpha = (token: IToken) =>
  patterns.ALPHABETIC_STAR.test(token.val!)

export const is_iden = (token: IToken) =>
  token.type === TokenType.TOKEN_IDENTIFIER

export const is_sem = (token: IToken) => token.val === ';'

export const is_spec = (token: IToken) =>
  token.type === TokenType.TOKEN_SPEC1 || //
  token.type === TokenType.TOKEN_SPEC2 || //
  token.type === TokenType.TOKEN_SPEC3 //

export const is_type = (token: IToken) =>
  token.val === typedef.Array || //
  token.val === typedef.Int || //
  token.val === typedef.Nil //

export const is_func = (token: IToken) => token.val === keywords.FUNCTION

export const is_while = (token: IToken) => token.val === keywords.WHILE

export const is_foreach = (token: IToken) => token.val === keywords.FOREACH

export const is_if = (token: IToken) => token.val === keywords.IF

export const is_of = (token: IToken) => token.val === keywords.OF

export const is_do = (token: IToken) => token.val === keywords.DO

export const is_else = (token: IToken) => token.val === keywords.ELSE

export const is_val = (token: IToken) => token.val === keywords.VAL

export const is_return = (token: IToken) => token.val === keywords.RETURN

export const is_returns = (token: IToken) => token.val === keywords.RETURNS

export const is_begin = (token: IToken) => token.val === keywords.BEGIN

export const is_end = (token: IToken) => token.val === keywords.END

export const is_eof = (token: IToken) => token.val === keywords.EOF

export const is_keyword = (token: IToken) =>
  is_of(token) ||
  is_while(token) ||
  is_foreach(token) ||
  is_if(token) ||
  is_do(token) ||
  is_else(token) ||
  is_val(token) ||
  is_return(token) ||
  is_returns(token) ||
  is_begin(token) ||
  is_end(token)

export const type_iden = (token: IToken) => is_iden(token) || is_type(token)
