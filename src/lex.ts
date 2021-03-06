import { patterns } from './constants'
import { Position } from './pos'
import { ILex, IPosition } from './types'
import fs from 'fs'
import { keywords } from './constants'
import { FD } from './io'
import { is_null, zero } from './utils'

export class Lex implements ILex {
  ch: string
  pos: IPosition
  private buffer: Buffer
  tmp: string
  line_number: number
  constructor(public fd: FD = -1, public index: number = -1) {
    this.buffer = Buffer.alloc(1)
    this.pos = new Position(1, 0)
    this.ch = ''
    this.tmp = ''
    this.line_number = 0
  }
  clear(): void {
    this.pos = new Position(1, 0)
    this.ch = ''
    this.tmp = ''
    this.line_number = 0
  }
  set_fd(fd: FD, index: number = -1) {
    this.fd = fd
    this.index = index
  }
  set_index(index: number) {
    this.clear_chars()
    if (this.index == index) return

    if (index > this.index) {
      while (!this.eof && index > this.index) {
        this.get_char(false)
      }
    } else {
      while (this.index > -1 && index < this.index) {
        this.un_get_char(false)
      }
    }
  }
  get get_index(): number {
    return this.index
  }
  update_ch() {
    if (is_null(this.fd)) return

    const num = fs.readSync(this.fd!, this.buffer, 0, 1, this.index)
    const ch = String.fromCharCode(this.buffer[0])
    //num zero means end of file
    this.ch = zero(num) ? keywords.EOF : ch
  }
  get_char(use_tmp = true): void {
    if (this.eof) {
      return this.clear_chars()
    }

    this.index++

    this.update_ch()
    //
    if (this.ch == '\n') this.pos.new_row()
    else this.pos.new_col()
    //
    if (use_tmp) this.tmp += this.ch
  }

  un_get_char(use_tmp = true): void {
    if (this.begin) {
      this.index = -1
      return this.clear_chars()
    } else {
      //
      this.index--
    }
    //
    this.update_ch()
    //
    if (this.ch == '\n') {
      this.pos.last_row()
      this.pos.last_col(this.col_back_line)
    }
    //
    else this.pos.last_col(this.pos.col - 1)

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
  get begin(): boolean {
    return this.index < 1
  }
  get col_back_line(): number {
    const saved = this.index
    let col = saved
    //rm \n
    this.un_get_char(false)
    while (!this.begin && !this.is_new_line) this.un_get_char()
    //index-1 for geting prev line of this line char
    if (!this.begin) col--
    //saved-1 for saved index prev getch
    col--
    //subtract to get size of offset in start col of line
    col = col - this.index
    this.set_index(saved)

    return col
  }
}
