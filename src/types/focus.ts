import { StatusIDEN } from 'src/parser/types'
import { SymNulable } from '.'

export interface IFocuse {
  sym: SymNulable
  status: StatusIDEN
  get is_foreach(): boolean
  get is_call(): boolean
  get is_free(): boolean
  get is_defined(): boolean
}

export interface IFocusList {
  call(symbol: SymNulable): void
  free(key: any): void
  foreach(symbol: SymNulable): void
  defind(symbol: SymNulable): void
  push(symbol: SymNulable, status: StatusIDEN): void
  pop(): void
  get focus(): IFocuse | null
  print(): void
}
