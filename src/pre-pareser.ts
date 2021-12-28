import { Parser } from './parser'
import { IRunner } from './types'

export class PostParser implements IRunner {
  constructor(public parser: Parser) {}

  run(): void {
    console.log('post parse start...')
    //code...
    console.log('post parse finihsed...')
  }
}
