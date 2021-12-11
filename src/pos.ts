import { IPosition } from './types'

export class Position implements IPosition {
  constructor(public row: number, public col: number) {}
}
