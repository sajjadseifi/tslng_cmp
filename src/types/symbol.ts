import { IPosition, Nullable } from '.'
import { sym } from '../constants'

type SymKeys = keyof typeof sym
export type SymbolType = typeof sym[SymKeys]
export type Scop = number
export type KeySymbol = string | Scop | undefined
export type SymNulable = Nullable<ISymbol>
export interface ISymbol {
  key?: KeySymbol
  subTables?: ISymbolTable
  type?: SymbolType
  is_func?: boolean
  index: number
  param_counts: number
  position: IPosition
  is_pub?: boolean
  linker_code:number
  is_load:boolean
  loaded():void
  unloaded():void
  used(): void
  un_used(): void
  get is_used(): boolean
  get used_number(): number
  to_pub(): void
  set_pub(is_pub: boolean): void
  set_type(type: SymbolType): void
  set_key(key: KeySymbol): void
  set_index(index: number): void
  set_pos(pos: IPosition): void
  set_prms_count(size: number): void
  add_symbol(sym: ISymbol): void
  init_subtable(parrent: ISymbolTable,pindex:number): void
  same(key: string): boolean
  set_reg(reg:number):void
  get get_reg():number
  set_likner(linker_code:number):void
}
export interface ISymbolTable {
  parrent?: ISymbolTable // if null this mean root
  symbols: ISymbol[]
  pindex:number
  get len(): number
  put(
    key: KeySymbol | undefined,
    type: SymbolType,
    is_func?: boolean,
    param_counts?: number
  ): SymNulable
  add_node(sym: ISymbol): void
  delete(key: string): SymNulable
  del_node(node: SymNulable): SymNulable
  get(key: string): SymNulable
  exist(key?: string): boolean
  clear(): void
  join(table: ISymbolTable): void
  find_in_all_scop(key: string): SymNulable
  find_in_scop(key: string): SymNulable
  find_globaly(key: string): SymNulable
  first(): SymNulable
  get last(): SymNulable
  builtin(
    name: string,
    ret_type: SymbolType,
    args?: string[],
    args_type?: SymbolType[]
  ): void
  used_all(): void
  get regs_all():number[]
  get regs_used():number[]
  index_by_name(name:string):number
}
