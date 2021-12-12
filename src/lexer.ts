import { Lex } from './lex'
import { ILex, TokenType } from './types'
import { ILexer, ILexerAtomata } from './types/lexer'
import { TokenError, TokenTypeError } from './types/type'
import { keywords, patterns } from './constants'
import { Token } from './token'
import { LexicalError } from './error'
export class Lexer implements ILexer, ILexerAtomata {
  lex: ILex
  finished: boolean
  constructor(public fd: number) {
    this.lex = new Lex(fd)
    this.finished = false
  }
  get ch(): string {
    // console.log('this.lex.ch', this.lex.ch)
    return this.lex.ch!
  }

  prev_token(): TokenError {
    throw new Error('Method not implemented.')
  }
  next_token(): TokenError {
    return this.init()
  }
  init(): TokenError {
    //cleraing tmp varaible of lexer
    this.lex.clear_chars()
    //skip all white space
    this.lex.skip_white_space()
    //get first new char in file
    this.lex.get_char()

    let tok_type: TokenTypeError
    if (this.lex.eof) return new Token(this.eof(), undefined, this.lex.pos)
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
  eof(): TokenType {
    this.finished = true
    return TokenType.EOF
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
    if (patterns.APHA_NUMERIC_UNDE.test(this.ch)) return this.iden()
    //is keyword token
    if (this.is_keyword()) return TokenType.TOKEN_KEYWORD

    return TokenType.TOKEN_IDENTIFIER
  }
  is_keyword(): boolean {
    //remove end char (bad charachter)
    this.lex.un_get_char()
    const val = this.lex.tmp
    //add removed char to resolve on the upper method (init) (bad charachter)
    this.lex.get_char()

    return keywords.list.some((k) => k === val)
  }
  spec1(): TokenType {
    //add for un-get-char in init
    const c = this.lex.ch
    //cant 2 cahrs token
    if (
      c == '(' ||
      c == ')' ||
      c == '{' ||
      c == '}' ||
      c == '[' ||
      c == ']' ||
      c == '"' ||
      c == "'"
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
    return new LexicalError('error 3 state machin')
  }
}
