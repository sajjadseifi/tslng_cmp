import * as tokens from './token'
import * as patterns from './pattern'

const num = [tokens.NUM, [patterns.NUMBER]]

const iden = [tokens.IDEN, [patterns.IDEBTIFIER]]

// const special = [tokens.SPECIAL, [patterns.SPECIALCHAR]]

const whitespace = [tokens.WHITESPACE, [patterns.WHITESPACE]]

// const comment = [tokens.COMMENT, [patterns.COMMENT]]

const keywords = [
  tokens.FUNCTION,
  [/function/],
  tokens.RETURNS,
  [/reutrns/],
  tokens.WHILE,
  [/while/],
  tokens.DO,
  [/do/],
  tokens.FOREACH,
  [/foreach/],
  tokens.IF,
  [/if/],
  tokens.ELSE,
  [/else/],
  tokens.RETURN,
  [/reutrn/],
  tokens.END,
  [/end/],
  tokens.VAL,
  [/val/],
  tokens.INT,
  [/Int/],
  tokens.ARRAY,
  [/Array/],
  tokens.NIL,
  [/Nil/]
]
const expr = [
  tokens.NOT,
  [/\!/],
  tokens.OR,
  [/\|\|/],
  tokens.AND,
  [/\&\&/],
  tokens.ASSIGN,
  [/\=/],
  tokens.LPRANS,
  [/\(/],
  tokens.RPRANS,
  [/\)/],
  tokens.LBRAKET,
  [/\[/],
  tokens.RBRAKET,
  [/\]/],
  tokens.LCBRAC,
  [/\{/],
  tokens.RCBRAC,
  [/\}/],
  tokens.QUESTION,
  [/\?/],
  tokens.COLON,
  [/\:/],
  tokens.SEM,
  [/\;/],
  tokens.COMMA,
  [/\,/],
  tokens.PLUS,
  [/\+/],
  tokens.MINES,
  [/\-/],
  tokens.MULTI,
  [/\*/],
  tokens.DEVID,
  [/\//],
  tokens.PERCENT,
  [/\%/],
  tokens.EQ,
  [/\=\=/],
  tokens.LT,
  [/\</],
  tokens.GT,
  [/\>/],
  tokens.LTEQ,
  [/\<\=/],
  tokens.GTEQ,
  [/\>\=/],
  tokens.NOTEQ,
  [/\!\=/]
]
export const lexer = [
  // ...comment,
  ...whitespace,
  ...keywords,
  ...expr,
  ...num,
  ...iden
]
