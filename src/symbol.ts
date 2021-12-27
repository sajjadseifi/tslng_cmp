import { Position } from './pos'
import {
  IPosition,
  ISymbol,
  ISymbolTable,
  KeySymbol,
  Scop,
  SymbolType,
  SymNulable
} from './types'

export class Sym implements ISymbol {
  subTables?: ISymbolTable
  is_func?: boolean
  index: number = -1
  position: IPosition
  constructor(
    public key?: string | Scop,
    public type?: SymbolType,
    public param_counts: number = -1
  ) {
    this.set_prms_count(param_counts)
    this.position = new Position(-1, -1)
  }
  is_used?: boolean | undefined
  used(): void {
    this.is_used = true
  }
  set_index(index: number): void {
    this.index = index
  }
  init_subtable(parrent: ISymbolTable): void {
    this.subTables = new SymbolTable()
    this.subTables.parrent = parrent
  }
  same(key: string): boolean {
    return key === this.key
  }
  set_type(type: SymbolType): void {
    this.type = type
  }
  set_key(key: KeySymbol): void {
    this.key = key
  }
  set_prms_count(size: number): void {
    this.param_counts = size
    this.is_func = size >= 0
  }
  add_symbol(sym: ISymbol): void {
    if (!this.subTables) throw new Error('SubTable Is Not Implimented.')

    const t = this.subTables as SymbolTable

    t.add_node(sym)
  }
}

export class SymbolTable implements ISymbolTable {
  symbols: ISymbol[]
  constructor() {
    this.symbols = []
  }
  get len() {
    return this.symbols.length
  }
  first(): ISymbol | null {
    if (this.len > 0) return null

    return this.symbols[0]
  }
  last(): ISymbol | null {
    if (this.len == 0) return null

    return this.symbols[this.len - 1]
  }
  join(table: ISymbolTable): void {
    table.symbols.forEach((sym) => this.symbols.push(sym))
  }

  del_node(node: ISymbol): ISymbol | null {
    if (node == null) return null

    const ind = this.index_by_node(node)

    if (ind < 0) return null

    this.del_by_index(ind)

    return node
  }
  index_by_node(node: ISymbol) {
    return this.symbols.findIndex((s) => s == node)
  }
  del_by_index(index: number) {
    this.symbols.filter((_, i) => i == index)
  }
  parrent?: ISymbolTable | undefined
  clear(): void {
    this.symbols = []
  }
  put(
    key: KeySymbol,
    type: SymbolType,
    is_func: boolean = false,
    param_counts?: number
  ): ISymbol | null {
    if (typeof key === 'string' && this.exist(key)) return null

    const new_sym = new Sym(key, type, param_counts) as ISymbol

    if (is_func) new_sym.init_subtable(this)

    this.add_node(new_sym)

    return new_sym
  }
  add_node(sym: ISymbol): void {
    this.symbols.push(sym)
  }
  private find(key: KeySymbol): number {
    return this.symbols.findIndex((s) => s.key == key)
  }
  delete(key: KeySymbol): ISymbol | null {
    const index = this.find(key)
    if (index == -1) {
      return null
    }
    const sym = this.symbols[index]

    this.del_by_index(index)

    return sym
  }
  get(key: string): ISymbol | null {
    const index = this.find(key)
    if (index == -1) {
      return null
    }
    return this.symbols[index]
  }
  exist(key: string): boolean {
    return this.find(key) != -1
  }
  find_in_all_scop(key: string): SymNulable {
    throw new Error('Method not implemented.')
  }
  find_in_scop(key: string): SymNulable {
    let sym = null
    for (let i = this.symbols.length - 1; i > -1; i--)
      if ((sym = this.symbols[i]).key === key) return sym

    return null
  }
  find_globaly(key: string): SymNulable {
    const node = this.find_in_scop(key)

    if (node) return node

    if (this.parrent == null) return null

    return this.parrent.find_globaly(key)
  }
}
