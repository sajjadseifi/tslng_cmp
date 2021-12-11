import { IPosition } from '.'

export interface Error {
  message: string
}

export interface LexerError {
  pos: IPosition
}
