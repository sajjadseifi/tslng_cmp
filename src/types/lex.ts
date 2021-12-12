import { IPosition } from '.'

export interface ILex {
  ch?: string
  length: number
  pos: IPosition
  tmp: string
  get_char(): void
  un_get_char(): void
  clear_chars(): void
  skip_white_space(): void
  get eof(): boolean
  get is_new_line(): boolean
}
