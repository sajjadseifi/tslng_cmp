import { patterns } from './constants'
import { Position } from './pos'
import { ILex, IPosition } from './types'

export class Lex implements ILex {
  ch: string
  length: number
  pos: IPosition
  index: number
  tmp: string
  constructor(public src: string) {
    this.length = src.length
    this.ch = ''
    this.index = -1
    this.pos = new Position(0, 0)
    this.tmp = ''
  }
  private update_ch() {
    this.ch = this.src[this.index]
  }
  get_char(): void {
    if (this.index >= this.length - 1) {
      this.index = this.length
      return this.clear_chars()
    }

    this.index++
    this.update_ch()
    this.tmp += this.ch
  }

  get is_new_line(): boolean {
    return patterns.NEW_LINE.test(this.ch)
  }
  un_get_char(): void {
    if (this.index < 1) {
      this.index = -1
      return this.clear_chars()
    }
    this.index--
    this.update_ch()
    if (this.tmp.length > 0) this.tmp = this.tmp.substr(0, this.tmp.length - 1)
  }

  clear_chars(): void {
    this.ch = ''
    this.tmp = ''
  }
  get eof(): boolean {
    return this.index >= this.length
  }
}
