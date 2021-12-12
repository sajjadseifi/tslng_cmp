import { patterns } from './constants'
import { Position } from './pos'
import { ILex, IPosition } from './types'
import fs from 'fs'

export class Lex implements ILex {
  ch?: string
  length: number
  pos: IPosition
  index: number
  private buffer: Buffer
  tmp: string
  constructor(public fd: number) {
    this.ch = ''
    this.index = -1
    this.pos = new Position(0, 0)
    this.tmp = ''
    this.length = 0
    this.buffer = Buffer.alloc(1)
  }
  private update_ch(offset: number) {
    const num = fs.readSync(this.fd, this.buffer, 0, 1, this.index)
    const ch = String.fromCharCode(this.buffer[0])
    if (num === 0) this.ch = undefined
    else this.ch = ch
  }
  get_char(): void {
    if (this.eof) {
      this.index = this.length
      return this.clear_chars()
    }

    this.index++
    this.update_ch(0)
    this.tmp += this.ch
  }

  get is_new_line(): boolean {
    return patterns.NEW_LINE.test(this.ch!)
  }
  un_get_char(): void {
    if (this.index < 1) {
      this.index = -1
      return this.clear_chars()
    }
    this.index--
    this.update_ch(-1)
    if (this.tmp.length > 0) this.tmp = this.tmp.substr(0, this.tmp.length - 1)
  }

  clear_chars(): void {
    this.ch = ''
    this.tmp = ''
  }
  get eof(): boolean {
    return this.ch == undefined
  }
}
