import { Lex } from './lex'
import { ILex, TokenType } from './types'
import { ILexer, ILexerAtomata } from './types/lexer'
import { TokenError, TokenTypeError } from './types/type'
import { keywords, patterns } from './constants'
export class Lexer implements ILexer, ILexerAtomata {
  lex: ILex
  tmp: string
  constructor(public src: string) {
    this.lex = new Lex(src)
    this.tmp = ''
  }
  prev_token(): TokenError {
    throw new Error('Method not implemented.')
  }
  next_token(): TokenError {
    throw new Error('Method not implemented.')
  }
  init(): TokenError {
    this.lex.get_char()
    this.tmp = this.lex.ch
    let tok_type: TokenTypeError
    //get identifier
    if (patterns.APHABETIC.test(this.tmp)) tok_type = this.iden()
    //get real number
    if (patterns.POINT.test(this.tmp)) tok_type = this.error5()
    //get number
    if (patterns.NUMERIC.test(this.tmp)) tok_type = this.num()

    //not founded tokens
    tok_type = this.error13()

    //Lexer Error
    if (typeof tok_type !== 'number')
      return {
        ...tok_type,
        pos: this.lex.pos
      }

    this.lex.un_get_char()
    //Itoken
    return {
      type: tok_type,
      val: this.tmp,
      pos: this.lex.pos
    }
  }
  comment_line(): void {
    throw new Error('Method not implemented.')
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
    const s2 = this.spec2()
    if (s2 !== false) return s2

    return TokenType.TOKEN_SPEC1
  }
  spec2(): TokenType | false {
    this.lex.get_char()
    if (this.tmp == '--') this.comment_line()

    const s3 = this.spec3()

    if (s3 !== false) return s3
    if (this.tmp == '==') return TokenType.TOKEN_SPEC2

    this.lex.un_get_char()

    return false
  }
  spec3(): TokenType | false {
    this.lex.get_char()
    if (this.tmp == '===') return TokenType.TOKEN_SPEC3

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
