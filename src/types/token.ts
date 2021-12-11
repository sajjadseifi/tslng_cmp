import { Value } from './type'

import { IPosition, TokenType } from '.'

export interface IToken {
  type: TokenType
  pos?: IPosition
  val: Value
}
