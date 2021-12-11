import { IPosition } from '.'

export interface ILex {
  src: string
  ch: string
  pos: IPosition
  get_char(): void
  un_get_char(): void
  clear_chars(): void
}
