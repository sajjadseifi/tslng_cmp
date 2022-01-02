import { keywords } from 'src/constants'
import {
  is_begin,
  is_end,
  is_lprns,
  is_rprns,
  is_sem,
  is_spec,
  is_type
} from 'src/utils/token-cheker'
import { IParser, SubParser } from './types'
export class HeadeParser extends SubParser implements IParser {
  parse(): void {}
  /*
    prog := func |
            func prog |

    func := fc ; |
            fc : ass-body end

    fdec := type iden(flist) 

    
    ass-body := 

  */
  prog(): void {
    if (this.parser.lexer.finished) return

    this.func()

    this.prog()
  }
  func(): void {
    this.fdec()
    //body stmt for use assembely code
    if (is_begin(this.parser.first_follow)) this.body()
    //
    else if (this.parser.in_follow(';')) this.parser.next()
    //
    else if (this.parser.modules.is_pre) this.parser.logger.expect_sem_error()
  }
  fdec(): void {}

  body(): void {
    //skip begin body token
    this.parser.next()
    //got to signle scop function decleartion
    this.parser.goto_scop(keywords.FUNCTION)
    /***
     *
     * ass-body parser generation
     *
     ***/
    //skip if  showed 'end' token
    this.parser.token_skipper(this.skipper_checker)
    //out of scop
    this.parser.out_scop()
  }
  skipper_checker(): boolean {
    const [t1, t2, t3] = this.parser.follow(3)
    //end of check
    if (is_end(t1)) return false
    //if person forget end blcok and then see type token
    if (is_type(t1)) return false
    //( for first toen
    if (is_rprns(t1) || is_lprns(t1)) return false
    //( for second & three token
    if (is_rprns(t2) || is_lprns(t3)) return true
    //skip
    return false
  }
}
