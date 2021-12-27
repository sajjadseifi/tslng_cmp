import { sym } from './constants'
import { StatusIDEN } from './parser'
import { Sym } from './symbol'
import { SymNulable } from './types'
import { IFocuse, IFocusList } from './types/focus'

export class FocusList implements IFocusList {
  private items: IFocuse[]
  constructor() {
    this.items = []
  }
  foreach(symbol: SymNulable): void {
    this.push(symbol, StatusIDEN.FOREACH)
  }
  get focus(): IFocuse | null {
    if (this.len > 0) {
      return this.items[0]
    }

    return null
  }
  get len() {
    return this.items.length
  }
  push(symbol: SymNulable, status: StatusIDEN): void {
    this.items.push({ sym: symbol, status })
  }
  pop(): void {
    if (this.len === 0) return
    this.items.pop()
  }
  call(symbol: SymNulable): void {
    this.push(symbol, StatusIDEN.CALL)
  }
  free(key: any): void {
    const snode = new Sym()
    snode.set_key(key)
    snode.set_type(sym.EMPTY)
    this.push(snode, StatusIDEN.FREE)
  }
  defind(symbol: SymNulable): void {
    this.push(symbol, StatusIDEN.DEFIND)
  }
}
