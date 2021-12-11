import { IPosition } from '.'

export interface Error {
  message: string
}

export interface ILexerError extends Error {
  pos?: IPosition
}
