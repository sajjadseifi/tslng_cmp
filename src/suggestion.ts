import { Compiler } from './compiler'
import { keywords } from './constants'
import { Parser } from './parser'
import { ILogger, IToken } from './types'

export interface ISuggestion {
  declared_and_not_used(): void
  first_must_after_follow(token: IToken, first: string, follow: string): void
}

export class Suggestion implements ISuggestion {
  constructor(public compiler: Compiler, public logger: ILogger) {}
  first_must_after_follow(token: IToken, first: string, follow: string): void {
    this.logger.syntax_err(
      `${first} must after token ${follow} near token '${token.val}'`
    )
  }

  declared_and_not_used(): void {
    const parser = this.compiler.parser as Parser
    let str, f
    let foreched: boolean = false
    const fcs = () => {
      if (foreched) return null
      const f = parser.focuses.focus
      foreched = f?.is_foreach as boolean
      return f
    }
    for (const symbl of parser.current_symbols)
      if (!symbl.is_used) {
        f = fcs()

        if (f?.is_foreach) str = `${keywords.FOREACH} identifier`
        else if (symbl.is_func) str = keywords.FUNCTION
        else str = keywords.VAL

        str = `${str} '${symbl.key}' is declared but not used`

        this.logger.warining(str)
      }
  }
}
