import { IPosition } from '.'

export interface ILex {
  src: string
  ch: string
  length: number
  pos: IPosition
  get_char(): void
  un_get_char(): void
  clear_chars(): void
  get eof(): boolean
}
