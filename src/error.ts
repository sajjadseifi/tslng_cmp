import { IPosition } from './types'
import { ILexerError } from './types/error'

export class LexicalError implements ILexerError {
  constructor(public message: string, public pos?: IPosition) {}
}
