import { IPosition } from '.'

export interface ILex {
  src: string
  current_pos: IPosition
  get_char(): string
  un_get_char(): string
}
