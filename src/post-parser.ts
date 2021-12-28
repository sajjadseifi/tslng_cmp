import { Parser } from './parser'
import { IRunner, ISymbolTable } from './types'

export class PreParser implements IRunner {
  constructor(public parser: Parser) {}
  run(): void {
    console.log('pre parse start...')
    //code...
    console.log('pre parse finihsed...')
  }
}
