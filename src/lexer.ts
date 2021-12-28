import { Lex } from './lex'
import { ILex, IPosition, IToken, TokenType } from './types'
import { ILexer, ILexerAtomata } from './types/lexer'
import { TokenError, TokenTypeError } from './types/type'
import { keywords, patterns } from './constants'
import { Token } from './token'
import { LexicalError } from './error'
import { NULL } from './constants/val'
import { APHA_NUMERIC_UNDE, SPECIAL_CHAR } from './constants/pattern'
export class Lexer implements ILexer, ILexerAtomata {
  lex: ILex
  finished: boolean
  constructor(public fd?: number) {
    this.lex = new Lex(fd)
    this.finished = false
  }
  set_fd(fd: number): void {
    this.lex.fd = fd
  }
  get pos(): IPosition {
    return this.lex.pos
  }

  skiper_signle_char(): void {
    while (
      //skip all to find single qoute
      patterns.SINGLE_QOUTE.test(this.ch) == false &&
      //skip all if ch present new line
      patterns.NEW_LINE.test(this.ch) == false
    ) {
      this.lex.get_char()
    }
  }
  str_single_cahr(): TokenTypeError {
    this.lex.get_char()

    if (patterns.SINGLE_QOUTE.test(this.ch)) {
      return new LexicalError('char can not be empty')
    }
    //if special char must be move to next cahr
    if (patterns.BACK_SLASH.test(this.ch)) {
      //skip char after back slash token
      this.lex.get_char()
    }
    //get char afeter '. or '\.
    this.lex.get_char()

    if (patterns.SINGLE_QOUTE.test(this.ch))
      return TokenType.TOKEN_STR_SINGLE_CHAR

    //find signle qout in the current line or nut skiping
    this.skiper_signle_char()

    return new LexicalError('this token is string , char length must be one')
  }

  str_linear(): TokenTypeError {
    this.lex.get_char()
    //if new char is not equal to (")
    if (patterns.DOUBLE_QOUTE.test(this.ch) == false) {
      //if bad char is a \n
      if (patterns.NEW_LINE.test(this.ch))
        return new LexicalError('string with qouteation cant be new line')
      else return this.str_linear()
    }
    //return if ch equal to "
    return TokenType.TOKEN_STR_LINEAE_CHARS
  }

  str_big_string(): TokenTypeError {
    this.lex.get_char()

    if (!patterns.BACKTICK.test(this.ch) && !this.lex.eof) this.str_big_string()

    if (this.lex.eof)
      return new LexicalError(
        'you are must be close <`> back tik to solved problem'
      )

    return TokenType.TOKEN_STR_BIG_CHARS
  }

  str(): TokenTypeError | null {
    switch (this.ch) {
      case '"':
        return this.str_linear()
      case '`':
        return this.str_big_string()
      case "'":
        return this.str_single_cahr()
    }
    return null
  }
  get ch(): string {
    return this.lex.ch!
  }

  prev_token(): TokenError {
    throw new Error('Method not implemented.')
  }
  next_token(): TokenError {
    return this.init()
  }
  follow(counts: number): TokenError[] {
    const lex = this.lex as Lex
    const saved = lex.get_index
    const res: TokenError[] = []

    while (counts-- > 0) res.push(this.next_token())

    lex.set_index(saved)

    return res
  }
  init(): TokenError {
    //cleraing tmp varaible of lexer
    this.lex.clear_chars()
    //skip all white space
    this.lex.skip_white_space()
    //get first new char in file
    this.lex.get_char()
    let tok_type: TokenTypeError
    if (this.lex.eof) return this.eof()
    //get identifier
    else if (patterns.APHABETIC.test(this.lex.tmp)) tok_type = this.iden()
    //get number
    else if (patterns.NUMERIC.test(this.lex.tmp)) tok_type = this.num()
    //get special char
    else if (patterns.SPECIAL_CHAR.test(this.lex.tmp)) {
      tok_type = this.spec1()
      //because the bottom of this function use un_get_char to solve addition get_char
      //spec not additional use get_char then use this statement to solve issue
      this.lex.get_char()
    }
    //not founded tokens
    else tok_type = this.error13()

    //Lexer Error
    if (tok_type instanceof LexicalError) {
      tok_type.pos = this.lex.pos
      return tok_type
    }

    this.lex.un_get_char()
    //if token is comment recursive initing token
    if (this.lex.tmp == '--' || this.lex.tmp == '/*') {
      return this.init()
    }
    //Itoken
    return new Token(tok_type as TokenType, this.lex.tmp, this.lex.pos)
  }
  eof(): IToken {
    this.finished = true
    return new Token(TokenType.EOF, undefined, this.lex.pos)
  }
  comment_line(): void {
    this.lex.get_char(false)
    //chek infinit time to find \n char
    while (!this.lex.is_new_line) this.lex.get_char(false)
    //to back last char
    this.lex.un_get_char(false)
    console.info('comment linear ignored...')
  }
  comment_star(): void {
    //chek infinit time to find \n char
    let finished = false
    while (!finished) {
      this.lex.get_char(false)

      if (patterns.STAR.test(this.ch)) {
        this.lex.get_char(false)

        if (patterns.SLASH.test(this.ch)) {
          this.lex.get_char(false)
          finished = true
          break
        }

        this.lex.un_get_char(false)
      }
    }
    //to back last char
    this.lex.un_get_char(false)
    console.info('comment star ignored...')
  }
  num(): TokenType {
    this.lex.get_char()
    //get number
    if (patterns.NUMERIC.test(this.ch)) return this.num()
    //get real number
    if (patterns.POINT.test(this.ch)) return this.real()

    return TokenType.TOKEN_NUMBER
  }
  real(): TokenType {
    this.lex.get_char()
    //get after Pint digit number
    if (patterns.NUMERIC.test(this.ch)) return this.real()

    return TokenType.TOKEN_REAL
  }
  iden(): TokenType {
    this.lex.get_char()
    //check alpha & numberic & "_"

    if (
      SPECIAL_CHAR.test(this.ch) === false ||
      APHA_NUMERIC_UNDE.test(this.ch)
    ) {
      return this.iden()
    }
    //is keyword token
    let tok_type = null
    if ((tok_type = this.keyword())) return tok_type

    return TokenType.TOKEN_IDENTIFIER
  }
  keyword(): TokenType | null {
    //remove end char (bad charachter)
    this.lex.un_get_char()
    //
    const val = this.lex.tmp
    //add removed char to resolve on the upper method (init) (bad charachter)
    this.lex.get_char()
    //
    switch (val) {
      case keywords.FUNCTION:
        return TokenType.TOKEN_KEYWORD_FUNCTION
      case keywords.RETURNS:
        return TokenType.TOKEN_KEYWORD_RETURNS
      case keywords.IF:
        return TokenType.TOKEN_IDENTIFIER
      case keywords.RETURN:
        return TokenType.TOKEN_KEYWORD_RETURN
      case keywords.VAL:
        return TokenType.TOKEN_KEYWORD_VAL
      case keywords.END:
        return TokenType.TOKEN_KEYWORD_END
      case keywords.DO:
        return TokenType.TOKEN_KEYWORD_DO
      case keywords.ELSE:
        return TokenType.TOKEN_KEYWORD_ELSE
      case keywords.OF:
        return TokenType.TOKEN_KEYWORD_OF
      case keywords.FOREACH:
        return TokenType.TOKEN_KEYWORD_FOREACH
      case keywords.WHILE:
        return TokenType.TOKEN_KEYWORD_WHILE
      default:
        return NULL
    }
  }
  spec1(): TokenTypeError {
    //add for un-get-char in init
    const c = this.lex.ch
    //if token is string return one of three type STR
    let str_tok = null
    if ((str_tok = this.str())) {
      return str_tok
    }
    //cant 2 cahrs token
    if (
      c == '(' ||
      c == ')' ||
      c == '{' ||
      c == '}' ||
      c == '[' ||
      c == ']' ||
      c == ':' ||
      c == ';'
    )
      return TokenType.TOKEN_SPEC1
    //if c == . can be real number
    if (c == '.') {
      this.lex.get_char()

      if (patterns.NUMERIC.test(this.lex.ch!)) return this.real()

      this.lex.un_get_char()
    }
    //can 2 chars token
    if (
      c == '=' ||
      c == '>' ||
      c == '<' ||
      c == '!' ||
      c == '&' ||
      c == '|' ||
      c == '/' ||
      c == '+' ||
      c == '-' ||
      c == '.' ||
      c == '*'
    )
      return this.spec2()

    // //get real number
    // else if (patterns.POINT.test(this.lex.tmp)) tok_type = this.error5()

    return TokenType.TOKEN_OTHERS
  }
  spec2(): TokenType {
    this.lex.get_char()
    const c2 = this.lex.tmp
    //if comment token return spec token and skip this line
    if (c2 == '--') {
      this.comment_line()
      return TokenType.TOKEN_SPEC2
    }
    if (c2 == '/*') {
      this.comment_star()
      return TokenType.TOKEN_SPEC2
    }
    //can not be 3 chars
    if (
      c2 == '<=' ||
      c2 == '>=' ||
      c2 == '++' ||
      c2 == '--' ||
      c2 == '**' ||
      c2 == '||' ||
      c2 == '&&'
    )
      return TokenType.TOKEN_SPEC2

    //can be 3 chars
    if (c2 == '==' || c2 == '!=' || c2 == '..') return this.spec3()

    this.lex.un_get_char()

    return TokenType.TOKEN_SPEC1
  }
  spec3(): TokenType {
    this.lex.get_char()
    const c3 = this.lex.tmp
    //3 size tok
    if (c3 == '===' || c3 == '!==' || c3 == '...') return TokenType.TOKEN_SPEC3

    //un get char to corrent position of spec2
    this.lex.un_get_char()
    return TokenType.TOKEN_SPEC2
  }
  error5(): TokenTypeError {
    return new LexicalError('error 5 state machin')
  }
  error13(): TokenTypeError {
    return new LexicalError('error 13 state machin')
  }
}
