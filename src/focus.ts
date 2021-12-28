import { sym } from './constants'
import { StatusIDEN } from './parser'
import { Sym } from './symbol'
import { SymNulable } from './types'
import { IFocuse, IFocusList } from './types/focus'

export class Focuse implements IFocuse {
  constructor(public sym: SymNulable, public status: StatusIDEN) {}
  get is_free(): boolean {
    return this.status === StatusIDEN.FREE
  }
  get is_foreach(): boolean {
    return this.status === StatusIDEN.FOREACH
  }
  get is_call(): boolean {
    return this.status === StatusIDEN.CALL
  }
  get is_defined(): boolean {
    return this.status === StatusIDEN.DEFINED
  }
}
export class FocusList implements IFocusList {
  private items: IFocuse[]
  constructor() {
    this.items = []
  }
  print() {
    this.items.map((it) => console.log(it.sym?.key, it.status))
  }
  foreach(symbol: SymNulable): void {
    this.push(symbol, StatusIDEN.FOREACH)
  }
  get focus(): IFocuse | null {
    if (this.len > 0) {
      return this.items[this.len - 1]
    }

    return null
  }
  get len() {
    return this.items.length
  }
  push(symbol: SymNulable, status: StatusIDEN): void {
    this.items.push(new Focuse(symbol, status))
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
    this.push(symbol, StatusIDEN.DEFINED)
  }
}
