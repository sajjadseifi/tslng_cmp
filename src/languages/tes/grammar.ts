import { Gramer, KeyPairRuleSet } from '../../types'
import * as tokens from './token'
import { lexer } from './lexer'

const prog: KeyPairRuleSet = [
  tokens.PROG,
  [tokens.FUNC, [tokens.FUNC, tokens.PROG]]
]

const func: KeyPairRuleSet = [
  tokens.FUNC,
  [
    [
      tokens.FUNCTION,
      tokens.IDEN,
      tokens.LPRANS,
      tokens.FLIST,
      tokens.RPRANS,
      tokens.RETURNS,
      tokens.TYPE,
      tokens.COLON,
      tokens.BODY,
      tokens.END
    ]
  ]
]

const body: KeyPairRuleSet = [
  tokens.BODY,
  [tokens.STMT, [tokens.STMT, tokens.BODY]]
]

const stmt: KeyPairRuleSet = [
  tokens.STMT,
  [
    [tokens.EXPR, tokens.SEM],
    [tokens.DEFVAR, tokens.SEM],
    [
      tokens.IF,
      tokens.LPRANS,
      tokens.EXPR,
      tokens.RPRANS,
      tokens.STMT,
      tokens.ELSE,
      tokens.STMT
    ],
    [tokens.IF, tokens.LPRANS, tokens.EXPR, tokens.RPRANS, tokens.STMT]
  ]
]

const defvar: KeyPairRuleSet = [
  tokens.DEFVAR,
  [[tokens.VAL, tokens.TYPE, tokens.IDEN]]
]

const expr: KeyPairRuleSet = [
  tokens.EXPR,
  [
    [tokens.IDEN, tokens.LPRANS, tokens.CLIST, tokens.RPRANS],
    [tokens.EXPR, tokens.LBRAKET, tokens.EXPR, tokens.RBRAKET],
    [tokens.EXPR, tokens.QUESTION, tokens.EXPR, tokens.COLON, tokens.EXPR],
    [tokens.EXPR, tokens.MULTI, tokens.EXPR],
    [tokens.EXPR, tokens.DEVID, tokens.EXPR],
    [tokens.EXPR, tokens.PERCENT, tokens.EXPR],
    [tokens.EXPR, tokens.PLUS, tokens.EXPR],
    [tokens.EXPR, tokens.MINES, tokens.EXPR],
    [tokens.EXPR, tokens.ASSIGN, tokens.EXPR],
    [tokens.EXPR, tokens.EQ, tokens.EXPR],
    [tokens.EXPR, tokens.NOTEQ, tokens.EXPR],
    [tokens.EXPR, tokens.LT, tokens.EXPR],
    [tokens.EXPR, tokens.GT, tokens.EXPR],
    [tokens.EXPR, tokens.GTEQ, tokens.EXPR],
    [tokens.EXPR, tokens.LTEQ, tokens.EXPR],
    [tokens.EXPR, tokens.OR, tokens.EXPR],
    [tokens.EXPR, tokens.AND, tokens.EXPR],
    [tokens.EXPR, tokens.NOT, tokens.EXPR],
    [tokens.NOT, tokens.EXPR],
    [tokens.MINES, tokens.EXPR],
    [tokens.PLUS, tokens.EXPR],
    [tokens.LPRANS, tokens.EXPR, tokens.RPRANS],
    tokens.IDEN,
    tokens.NUM
  ]
]

const flist: KeyPairRuleSet = [
  tokens.FLIST,
  [
    [tokens.TYPE, tokens.IDEN],
    [tokens.TYPE, tokens.IDEN, tokens.COMMA, tokens.FLIST]
  ]
]

const clist: KeyPairRuleSet = [
  tokens.CLIST,
  [tokens.EXPR, [tokens.EXPR, tokens.COMMA, tokens.CLIST]]
]

const type: KeyPairRuleSet = [
  tokens.TYPE,
  [tokens.INT, tokens.ARRAY, tokens.NIL]
]

export const root = tokens.PROG

export const tesGramer: Gramer = [
  // Lexical grammar
  ...lexer,
  // Gramer rules
  // ...prog,
  // ...func,
  // ...body,
  // ...stmt,
  tokens.PROG,
  [tokens.DEFVAR],

  tokens.DEFVAR,
  [[tokens.VAL, tokens.TYPE, tokens.IDEN]],

  tokens.TYPE,
  [tokens.INT, tokens.ARRAY, tokens.NIL]

  // ...expr,
  // ...flist,
  // ...clist,
  // ...type
]

export const ignored = [tokens.WHITESPACE]
