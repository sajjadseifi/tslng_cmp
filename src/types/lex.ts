import { IPosition } from '.'

export interface ILex {
  ch: string
  length: number
  pos: IPosition
  tmp: string
  line_number: number
  get_char(use_tmp?: boolean): void
  un_get_char(use_tmp?: boolean): void
  clear_chars(): void
  skip_white_space(): void
  get eof(): boolean
  get is_new_line(): boolean
}
