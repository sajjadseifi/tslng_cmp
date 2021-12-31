import { FD } from 'src/io'
import { IPosition } from '.'

export interface ILexProps {
  fd: FD
  index: number
}

export interface ILex {
  fd?: FD
  ch: string
  pos: IPosition
  tmp: string
  line_number: number
  set_fd(fd: number, index: number): void
  get_char(use_tmp?: boolean): void
  un_get_char(use_tmp?: boolean): void
  clear_chars(): void
  skip_white_space(): void
  get eof(): boolean
  get is_new_line(): boolean
  clear(): void
}
