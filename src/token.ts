import { IPosition, IToken, TokenType } from './types'

export class Token implements IToken {
  constructor(
    public type: TokenType,
    public val: string,
    public pos?: IPosition
  ) {}
}
