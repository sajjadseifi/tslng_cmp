import { IToken } from '.'

export interface ILex {
  next_token(): IToken
}
