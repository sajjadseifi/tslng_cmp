import { keywords } from '../constants'
import { imp_or_mod, is_imp, is_str } from '../utils/token-cheker'
import { IParser, SubParser } from './types'

export class DefParser extends SubParser implements IParser {
  parse(): void {
    this.import()
  }
  // import :=  |
  //         imp "module"
  //         import
  //module := Regex for file address
  import(): boolean {
    const [imp, mod] = this.parser.follow(2)
    //end of import
    if (!imp_or_mod(imp) && !imp_or_mod(mod)) return true
    //
    if (is_imp(imp)) this.parser.next()
    else {
      this.parser.logger.correct_word_place(imp, keywords.IMP)

      if (is_str(imp)) {
        return this.module()
      }
    }
    //next "module"
    if (!this.module()) return false
    //
    return this.import()
  }
  module(): boolean {
    const mod = this.parser.first_follow
    if (!is_str(mod)) {
      if (is_imp(mod)) {
        this.parser.logger.syntax_err('pleas remove additional import statemnt')
        return this.import()
      }
      //this error module
      this.parser.logger.syntax_err(
        'after imp keyword must add "module" experion'
      )
      return false
    }

    this.parser.imports.push(this.rm_quted(mod.val))
    //next "module"
    this.parser.next()

    return true
  }
  rm_quted(_qted?: string): string {
    _qted = `${_qted}`
    return _qted.substring(1, _qted.length - 1)
  }
}
