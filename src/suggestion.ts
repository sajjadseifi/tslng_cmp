import { Compiler } from './compiler'
import { keywords } from './constants'
import { Parser } from './parser'
import { ILogger, IToken } from './types'
import colors from 'colors'
import { iden_qute, kword_qute } from './logger'
import { IGraphNode } from './lib/graph'
import { IModule } from './graph-module'

export interface ISuggestion {
  set_sug_status(status?: boolean): void
  declared_and_not_used(node: IGraphNode<IModule>): void
  first_must_after_follow(token: IToken, first: string, follow: string): void
}

export class Suggestion implements ISuggestion {
  status: boolean
  constructor(public compiler: Compiler, public logger: ILogger) {
    this.status = false
    return new Proxy(this, {
      get: (target: any, p: any, reciver: any) => {
        return this.status ? target[p] : () => {}
      }
    })
  }
  set_sug_status(status: boolean): void {
    this.status = status
  }
  first_must_after_follow(token: IToken, first: string, follow: string): void {
    const frsc = colors.yellow(first)
    const flwc = colors.yellow(follow)
    const tokc = colors.yellow(token.val!)
    this.logger.syntax_err(`${frsc} must after ${flwc} near token ${tokc}`)
  }

  declared_and_not_used(node: IGraphNode<IModule>): void {
    const parser = this.compiler.parser as Parser
    let str, f
    let foreched: boolean = false
    const fcs = () => {
      if (foreched) return null
      const f = parser.focuses.focus
      foreched = f?.is_foreach as boolean
      return f
    }
    for (const symbl of node.value.symbols.symbols)
      if (!symbl.is_used) {
        f = fcs()

        const kec = iden_qute(symbl.key as string)

        if (f?.is_foreach) {
          str = `${kword_qute(keywords.FOREACH)} identifier`
        } else if (symbl.is_func) {
          str = kword_qute(keywords.FUNCTION)
        } else {
          str = kword_qute(keywords.VAL)
        }

        this.logger.warining(`${str} ${kec} is declared but not used`)
      }
  }
}
