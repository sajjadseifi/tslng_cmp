import { Position } from './pos'
import { ILex, IPosition } from './types'

export class Lex implements ILex {
  ch = ''
  length = 0
  pos: IPosition
  index = 0

  constructor(public src: string) {
    this.length = src.length
    this.pos = new Position(0, 0)
  }
  private update_ch() {
    this.ch = this.src[this.index]
  }
  get_char(): void {
    this.index++
    this.update_ch()
  }

  un_get_char(): void {
    this.index--
    this.update_ch()
  }

  clear_chars(): void {
    this.ch = ''
  }
  get eof() {
    return this.index >= this.length
  }
}
