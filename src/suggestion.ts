import { Parser } from './parser'
import { ILogger } from './types'

export interface ISuggestion {
  declared_and_not_used(): void
}

export class Suggestion implements ISuggestion {
  constructor(public parser: Parser, public logger: ILogger) {}
  declared_and_not_used(): void {
    for (const sym of this.parser.current_symbols)
      if (!sym.is_used) {
        this.logger.declared_and_not_used(sym)
      }
  }
}
