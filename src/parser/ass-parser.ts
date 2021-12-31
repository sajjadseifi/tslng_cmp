import { IParser, SubParser } from './types'
export class AssParser extends SubParser implements IParser {
  parse(): void {
    throw new Error('Method not implemented.')
  }
}
