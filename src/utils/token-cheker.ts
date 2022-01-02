import { typedef, keywords, patterns } from '../constants'
import { IToken, TokenType } from '../types'

export const is_num = (token: IToken) =>
  token && token.type === TokenType.TOKEN_NUMBER

export const is_alpha = (token: IToken) =>
  patterns.ALPHABETIC_STAR.test(token && token.val!)

export const is_iden = (token: IToken) =>
  token && token.type === TokenType.TOKEN_IDENTIFIER

export const is_sem = (token: IToken) => token && token.val === ';'
export const is_str = (token: IToken) =>
  token && token.type === TokenType.TOKEN_STR_LINEAE_CHARS

export const is_spec = (token: IToken) =>
  (token && token.type === TokenType.TOKEN_SPEC1) || //
  (token && token.type === TokenType.TOKEN_SPEC2) || //
  (token && token.type === TokenType.TOKEN_SPEC3) //

export const is_type = (token: IToken) =>
  (token && token.val === typedef.Array) || //
  (token && token.val === typedef.Int) || //
  (token && token.val === typedef.Nil) //

export const is_imp = (token: IToken) => token && token.val === keywords.IMP

export const imp_or_mod = (token: IToken) =>
  token && (is_imp(token) || is_str(token))

export const is_pub = (token: IToken) => token && token.val === keywords.PUB

export const is_func = (token: IToken) =>
  token && token.val === keywords.FUNCTION

export const is_while = (token: IToken) => token && token.val === keywords.WHILE

export const is_foreach = (token: IToken) =>
  token && token.val === keywords.FOREACH

export const is_if = (token: IToken) => token && token.val === keywords.IF

export const is_of = (token: IToken) => token && token.val === keywords.OF

export const is_do = (token: IToken) => token && token.val === keywords.DO

export const is_else = (token: IToken) => token && token.val === keywords.ELSE

export const is_val = (token: IToken) => token && token.val === keywords.VAL

export const is_return = (token: IToken) =>
  token && token.val === keywords.RETURN

export const is_returns = (token: IToken) =>
  token && token.val === keywords.RETURNS

export const is_begin = (token: IToken) => token && token.val === keywords.BEGIN

export const is_end = (token: IToken) => token && token.val === keywords.END

export const is_eof = (token: IToken) => token && token.val === keywords.EOF
export const is_lprns = (token: IToken) => token && token.val === '('
export const is_rprns = (token: IToken) => token && token.val === ')'

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
