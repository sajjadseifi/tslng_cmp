import { Position } from './pos'
import {
  IPosition,
  ISymbol,
  ISymbolTable,
  KeySymbol,
  Nullable,
  Scop,
  SymbolType,
  SymNulable
} from './types'

export class Sym implements ISymbol {
  subTables?: ISymbolTable
  is_func?: boolean
  index: number = -1
  position: IPosition
  is_pub?: boolean
  private _used_sym_number: number
  private reg;
  linker_code: number
  is_load: boolean
  __used__?:boolean
  constructor(
    public key?: string | Scop,
    public type?: SymbolType,
    public param_counts: number = -1
  ) {
    this.is_pub = false
    this._used_sym_number = 0
    this.set_prms_count(param_counts)
    this.position = new Position(-1, -1)
    this.reg = -1;
    this.linker_code = -1;
    this.is_load = false
  }
  loaded(): void {
    this.is_load = true
  }
  unloaded(): void {
    this.is_load = false
  }

  set_likner(linker_code: number): void {
    this.linker_code = linker_code
  }
  set_reg(reg: number): void {
    this.reg= reg;
  }
  get get_reg(): number {
    return this.reg
  }
  get is_used(): boolean {
    return !!this.__used__
  }
  get used_number(): number {
    return this._used_sym_number
  }
  set_pos(pos: IPosition): void {
    this.position = pos
  }
  used(): void {
    if(!this.__used__)
      this.__used__ = true
    
    this._used_sym_number++
  }
  un_used(): void {
    this._used_sym_number--
  }
  set_index(index: number): void {
    this.index = index
  }
  init_subtable(parrent: ISymbolTable,pindex:number=-1): void {
    this.subTables = new SymbolTable(pindex)
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
  set_pub(is_pub: boolean): void {
    this.is_pub = is_pub
  }
  to_pub(): void {
    this.is_pub = true
  }
}

export class SymbolTable implements ISymbolTable {
  symbols: ISymbol[]
  parrent?: ISymbolTable

  constructor(public pindex = -1) {
    this.symbols = []
  }
  builtin(
    name: string,
    ret_type: SymbolType,
    args: string[] = [],
    args_type: SymbolType[] = []
  ): void {
    let prmc = args.length < args_type.length ? args.length : args_type.length
    const func = this.put(name, ret_type, true, prmc)
    if (func === null) return

    func.init_subtable(this,-1)

    for (let i = 0; i < prmc; i++) {
      func.subTables!.put(args[i], args_type[i])
    }
  }
  used_all(): void {
    this.symbols.forEach((sym) => sym.used())
  }
  get len() {
    return this.symbols.length
  }
  first(): ISymbol | null {
    if (this.len > 0) return null

    return this.symbols[0]
  }
  get last(): ISymbol | null {
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
  clear(): void {
    this.symbols = []
  }
  put(
    key: KeySymbol,
    type: SymbolType,
    is_func: boolean = false,
    param_counts: number=-1,
    pindex: number=-1,
  ): ISymbol | null {
    if (typeof key === 'string' && this.exist(key)) return null

    const new_sym = new Sym(key, type, param_counts) as ISymbol

    if (is_func) new_sym.init_subtable(this,pindex)

    this.add_node(new_sym)

    return new_sym
  }
  add_node(sym: ISymbol): void {
    this.symbols.push(sym)
  }
  private find(key: KeySymbol): number {
    return this.symbols.findIndex((s) => s.key === key)
  }
  delete(key: KeySymbol): Nullable<ISymbol> {
    const index = this.find(key)
    if (index == -1) {
      return null
    }
    const sym = this.symbols[index]

    this.del_by_index(index)

    return sym
  }
  get(key: string): Nullable<ISymbol> {
    const index = this.find(key)
    if (index == -1) {
      return null
    }
    return this.symbols[index]
  }
  exist(key?: string): boolean {
    return this.find(key) != -1
  }
  find_in_all_scop(key: string): SymNulable {
    throw new Error('Method not implemented.')
  }
  find_in_scop(key: string): SymNulable {
    let sym = null
    for (let i = this.symbols.length - 1; i > -1; i--)
    {
      sym = this.symbols[i]
      if (sym.key === key) return sym
    }

    return null
  }
  find_globaly(key: string): SymNulable {
    const node = this.find_in_scop(key)

    if (node) return node

    if (this.parrent == null) return null

    return this.parrent.find_globaly(key)
  }
  get regs_all():number[]{
    return this.symbols.map(s=>s.get_reg);
  }
  
  get regs_used():number[]{
    return this.symbols.filter(s=>s.is_used).map(s=>s.get_reg)
  }
  index_by_name(name:string):number{
    return this.symbols.findIndex((s)=>s.key === name)
  }
}
