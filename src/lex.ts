import { patterns } from './constants'
import { Position } from './pos'
import { ILex, IPosition } from './types'
import fs from 'fs'
import { keywords } from './constants'

export class Lex implements ILex {
  dir: number = 0
  ch: string
  length: number
  pos: IPosition
  index: number
  private buffer: Buffer
  tmp: string
  line_number: number
  constructor(public fd: number) {
    this.ch = ''
    this.index = -1
    this.pos = new Position(0, 0)
    this.tmp = ''
    this.length = 0
    this.buffer = Buffer.alloc(1)
    this.dir_next()
    this.line_number = 0
  }
  dir_next() {
    this.dir = 1
  }
  dir_prev() {
    this.dir = -1
  }
  get is_next() {
    return this.dir == -1
  }
  set_index(index: number) {
    this.index = index
    this.update_ch()
  }
  get get_index(): number {
    return this.index
  }
  update_ch() {
    const num = fs.readSync(this.fd, this.buffer, 0, 1, this.index)
    const ch = String.fromCharCode(this.buffer[0])
    if (num === 0) {
      this.ch = keywords.EOF
    } else {
      this.ch = ch
    }
  }
  get_char(use_tmp = true): void {
    if (this.eof) {
      return this.clear_chars()
    }

    this.index++

    this.update_ch()

    if (this.ch == '\n') this.line_number++

    if (use_tmp) this.tmp += this.ch
  }

  un_get_char(use_tmp = true): void {
    if (this.index < 1) {
      this.index = -1
      return this.clear_chars()
    }

    this.index--

    this.update_ch()

    if (this.ch == '\n') this.line_number--

    if (use_tmp && this.tmp.length > 0)
      this.tmp = this.tmp.substr(0, this.tmp.length - 1)
  }
  get is_new_line(): boolean {
    return patterns.NEW_LINE.test(this.ch!)
  }
  clear_chars(): void {
    this.ch = ''
    this.tmp = ''
  }
  skip_white_space(): void {
    //at first char
    this.get_char(false)
    //check if white space loop infinit
    while (patterns.WHITE_SPACE.test(this.ch!)) this.get_char(false)
    //while end ch dosnt white space
    this.un_get_char(false)
  }
  get eof(): boolean {
    return this.ch == keywords.EOF
  }
}
