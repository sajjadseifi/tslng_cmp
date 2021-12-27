import { IPosition } from './types'

export class Position implements IPosition {
  constructor(public row: number, public col: number) {}
  last_row(): void {
    this.row--
  }
  last_col(col: number): void {
    this.col = col
  }
  new_row(): void {
    this.row++
  }
  new_col(): void {
    this.col++
  }
}
