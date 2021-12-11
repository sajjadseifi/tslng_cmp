export interface IPosition {
  row: number
  col: number
  last_row(): void
  last_col(): void
  new_row(): void
  new_col(): void
}
