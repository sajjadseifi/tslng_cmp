import { Lex } from './lex'
import { ILex, IToken, TokenType } from './types'
import { ILexer, ILexerAtomata } from './types/lexer'
import { TokenError, TokenTypeError } from './types/type'
import { keywords, patterns } from './constants'
import { WHITE_SPACE } from './constants/pattern'
export class Lexer implements ILexer, ILexerAtomata {
  lex: ILex
  tmp: string
  constructor(public src: string) {
    this.lex = new Lex(src)
    this.tmp = ''
  }
  skip_white_space() {
    //at first char
    this.lex.get_char()

    //check if white space loop infinit
    while (WHITE_SPACE.test(this.lex.ch)) this.lex.get_char()

    //while end ch dosnt white space
    this.lex.un_get_char()
  }
  prev_token(): TokenError {
    throw new Error('Method not implemented.')
  }
  next_token(): TokenError {
    this.skip_white_space()
    return this.init()
  }
  init(): TokenError {
    this.lex.get_char()
    this.tmp = this.lex.ch
    let tok_type: TokenTypeError

    //get identifier
    if (patterns.APHABETIC.test(this.tmp)) tok_type = this.iden()
    //get real number
    else if (patterns.POINT.test(this.tmp)) tok_type = this.error5()
    //get number
    else if (patterns.NUMERIC.test(this.tmp)) tok_type = this.num()
    //get special char
    else if (patterns.SPECIAL_CHAR.test(this.tmp)) tok_type = this.spec1()

    //not founded tokens
    tok_type = this.error13()

    //Lexer Error
    if (typeof tok_type !== 'number')
      return {
        ...tok_type,
        pos: this.lex.pos
      }

    this.lex.un_get_char()
    if (this.tmp == '--') return this.init()
    //Itoken
    return {
      type: tok_type,
      val: this.tmp,
      pos: this.lex.pos
    }
  }
  comment_line(): void {
    this.lex.get_char()
    while (patterns.NEW_LINE.test(this.lex.ch)) this.lex.get_char()
    this.lex.get_char()
  }
  comment_star(): void {
    throw new Error('Method not implemented.')
  }
  num(): TokenType {
    this.lex.get_char()
    this.tmp += this.lex.ch
    //get number
    if (patterns.NUMERIC.test(this.lex.ch)) return this.num()
    //get real number
    if (patterns.POINT.test(this.lex.ch)) return this.real()

    return TokenType.TOKEN_NUMBER
  }
  real(): TokenType {
    this.lex.get_char()
    //get after Pint digit number
    if (patterns.NUMERIC.test(this.lex.ch)) return this.real()

    return TokenType.TOKEN_REAL
  }
  iden(): TokenType {
    this.lex.get_char()
    //check alpha & numberic & "_"
    if (patterns.APHA_NUMERIC_UNDE.test(this.lex.ch)) return this.iden()
    //is keyword token
    if (this.is_keyword()) return TokenType.TOKEN_KEYWORD

    return TokenType.TOKEN_IDENTIFIER
  }
  is_keyword(): boolean {
    return keywords.list.some((k) => k === this.tmp)
  }
  spec1(): TokenType {
    const s2 = this.spec2(this.tmp)
    //add for un-get-char in init
    this.lex.get_char()

    if (s2 !== false) return s2

    return TokenType.TOKEN_SPEC1
  }
  spec2(c1: string): TokenType | false {
    this.lex.get_char()
    const str = c1 + this.lex.ch
    if (str == '--') {
      this.comment_line()
      return TokenType.TOKEN_SPEC2
    }

    const s3 = this.spec3(str)

    if (s3 !== false) return s3

    //2 size tok
    if (str == '==') return TokenType.TOKEN_SPEC2
    //un get char to corrent position of spec1
    this.lex.un_get_char()

    return false
  }
  spec3(c2: string): TokenType | false {
    this.lex.get_char()
    //3 size tok
    if (this.tmp == '===') return TokenType.TOKEN_SPEC3

    //un get char to corrent position of spec2
    this.lex.un_get_char()
    return false
  }
  error5(): TokenTypeError {
    return {
      message: 'error 5 state machin'
    }
  }
  error13(): TokenTypeError {
    return {
      message: 'error 13 state machin'
    }
  }
}
