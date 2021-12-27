import { StatusIDEN } from '../parser'
import { SymNulable } from '.'

export interface IFocuse {
  sym: SymNulable
  status: StatusIDEN
}

export interface IFocusList {
  call(symbol: SymNulable): void
  free(key: any): void
  foreach(symbol: SymNulable): void
  defind(symbol: SymNulable): void
  push(symbol: SymNulable, status: StatusIDEN): void
  pop(): void
  get focus(): IFocuse | null
}
