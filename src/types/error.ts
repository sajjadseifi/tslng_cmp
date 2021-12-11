import { IPosition } from '.'

export interface Error {
  message: string
}

export interface LexerError extends Error {
  pos?: IPosition
}
