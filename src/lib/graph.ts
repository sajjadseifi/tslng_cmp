import colros from 'colors'
import { Iloging } from '../graph-module'
import { strble_mode_parse } from '../parser/types'
import { Nullable } from '../types'
import { is_null } from '../utils'

export type Key = number | string | any
export type Value<T> = T

export enum SearchMode {
  PRE_ORDER,
  IN_ORDER,
  POST_ORDER,
  BFS,
  DFS
}
export type AsyncTraversalExcutor<T> = (node: IGraphNode<T>) => Promise<boolean>
export type TraversalExcutor<T> = (node: IGraphNode<T>) => boolean
export interface IGraphNode<T> {
  key: Key
  value: Value<T>
  children: IGraphNode<T>[]
  visited: boolean
  is_child(key: Key): boolean
  get_child(key: Key): Nullable<IGraphNode<T>>
  rm_child(key: Key): Nullable<IGraphNode<T>>
  visit(): void
  un_visit(): void
  log(start?: string): void
}

export interface IGraph<T> {
  root: Nullable<IGraphNode<T>>
  get len(): number
  open_log(): void
  close_log(): void
  add_generic(value: Value<T>, pkey: Key): Nullable<IGraphNode<T>>
  add_by_key(ckey: Key, pkey: Key): Nullable<IGraphNode<T>>
  add(
    node: IGraphNode<T>,
    parent: Nullable<IGraphNode<T>>
  ): Nullable<IGraphNode<T>>
  addT(
    key: Key,
    value: T,
    parent: Nullable<IGraphNode<T>>
  ): Nullable<IGraphNode<T>>
  rm(node: IGraphNode<T>): Nullable<IGraphNode<T>>
  rm_by_key(key: Key): Nullable<IGraphNode<T>>
  search(node: IGraphNode<T>): Nullable<IGraphNode<T>>
  search_by_key(key: Key): Nullable<IGraphNode<T>>
  parents(key: Key | IGraphNode<T>): IGraphNode<T>[]
  traversal(
    mode: SearchMode,
    cb?: TraversalExcutor<T>,
    root?: IGraphNode<T>
  ): void
  pruning(): void
  clear(): void
  un_visit_all(root: IGraphNode<T>): void
}

export class GraphNode<T extends Iloging & any> implements IGraphNode<T> {
  children: IGraphNode<T>[]
  visited: boolean
  constructor(public key: Key, public value: T) {
    this.visited = false
    this.children = []
  }
  log(start?: string): void {
    console.log(
      start || '',
      colros.cyan(this.key as string),
      colros.red('visited : ' + this.visited)
    )
  }

  set_value(value: Value<T>) {
    this.value = value
  }
  set_key(key: Key) {
    this.key = key
  }
  visit(): void {
    this.visited = true
  }
  un_visit(): void {
    this.visited = false
  }
  add_child(child: IGraphNode<T>): void {
    //if exist not add
    const exist = this.children.some((c) => c.key === child.key)
    //if dont exist add to childs
    if (!exist) this.children.push(child)
  }
  get_child(key: Key): Nullable<IGraphNode<T>> {
    for (const ch of this.children) {
      if (ch.key === key) return ch
    }
    return null
  }
  is_child(key: Key): boolean {
    return this.children.findIndex((ch) => ch.key === key) != -1
  }
  rm_child(key: Key): Nullable<IGraphNode<T>> {
    const index = this.children.findIndex((ch) => ch.key === key)

    if (index === -1) return null

    const node = this.children[index]

    this.children = this.children.filter((ch) => ch === node)

    return node
  }
}

const _defualt_executor = <T>(node: IGraphNode<T>): boolean => {
  console.log(node.key)
  return true
}

export class Graph<T> implements IGraph<T> {
  private uniq_key: number
  root: Nullable<IGraphNode<T>>
  logging: boolean = false
  private _len: number
  constructor(
    public executor: TraversalExcutor<T> = _defualt_executor,
    public generic?: boolean
  ) {
    this.uniq_key = 0
    this._len = 0
    this.root = null
  }
  get len(): number {
    return this._len
  }
  open_log() {
    this.logging = true
  }

  close_log() {
    this.logging = false
  }
  private exc(node: IGraphNode<T>, executor?: TraversalExcutor<T>) {
    //log node if logging is open
    if (this.logging) console.log(node)
    //if executer not exist
    //In the absence of {executor}
    // the output is the amount of {logging} that continues if it is open, if it is closed
    if (!executor) return this.logging
    //output of executer to check continues
    const resp = executor(node)

    //catched on upper level
    if (!resp) throw resp
    //return true to traversal
    return resp
  }

  private increase_uniq() {
    this.uniq_key++
  }
  add_generic(value: Value<T>, pkey: Key): Nullable<IGraphNode<T>> {
    const parent = this.search_by_key(pkey)

    if (this.root && parent === null) return null

    this.increase_uniq()
    const node = new GraphNode(this.uniq_key, value)
    //if exist node increased key
    while (this.search(node)) {
      this.increase_uniq()
      node.set_key(this.uniq_key)
    }
    //
    this.add(node, parent)
    return node
  }
  add_by_pk(key: Key, value: T, pkey: Key): Nullable<IGraphNode<T>> {
    const parent = this.search_by_key(pkey)

    if (parent) {
      return this.addT(key, value, parent)
    }

    return null
  }
  add_by_key(ckey: number, pkey: Key): Nullable<IGraphNode<T>> {
    const parent = this.search_by_key(pkey)

    if (parent === null) return null

    const node = this.search_by_key(ckey)

    if (node == null) return null

    this.add(node, parent)

    return node
  }
  addT(key: Key, value: T, parent: IGraphNode<T>): Nullable<IGraphNode<T>> {
    const node = new GraphNode<T>(key, value)
    return this.add(node, parent)
  }
  add(
    node: IGraphNode<T>,
    parrent: Nullable<IGraphNode<T>>
  ): Nullable<IGraphNode<T>> {
    const _node = this.search_by_key(node.key) || node
    //add len
    if (_node == node) this._len++

    if (this.root === null) this.root = _node
    else {
      const p = parrent as GraphNode<T>
      //if node child of parent
      if (p.is_child(_node.key)) return null
      //add child to parent
      p.add_child(_node)
    }

    return _node
  }
  rm(node: IGraphNode<T>): Nullable<IGraphNode<T>> {
    const _node = this.search(node)

    if (_node) return this.rm_by_key(_node.key)

    return null
  }
  rm_by_key(key: Key): Nullable<IGraphNode<T>> {
    const node = this.search_by_key(key)

    if (this.root === node) {
      this._len = 0
      this.root = null
    }

    if (node) {
      //find parretns
      const prs = this.parents(key)
      //rm child on parrent
      prs.forEach((p) => p.rm_child(key))
      //decrease
      this._len--
    }
    //

    return node
  }
  parents(key: Key | IGraphNode<T>): IGraphNode<T>[] {
    const prs: IGraphNode<T>[] = []
    const tk = typeof key === 'number' || typeof key === 'string'
    const _key: Key = tk ? key : key.key
    this.traversal(
      //bearth first mode
      SearchMode.BFS,
      (node) => {
        if (node.is_child(_key))
          //add parent node to paretns(prs) varialbe if key is child of self
          prs.push(node)
        return true
      }
    )

    return prs
  }
  search(node: IGraphNode<T>): Nullable<IGraphNode<T>> {
    let exist = null

    this.traversal(SearchMode.BFS, (root) => {
      if (root !== node) return true

      exist = root
      return false
    })

    return exist
  }
  search_by_key(key: Key): Nullable<IGraphNode<T>> {
    let exist: Nullable<IGraphNode<T>> = null

    const cb = (root: IGraphNode<T>) => {
      if (root.key !== key) return true

      exist = root
      return false
    }

    this.traversal(SearchMode.BFS, cb)

    return exist
  }

  traversal(
    mode: SearchMode,
    cb?: TraversalExcutor<T>,
    root?: Nullable<IGraphNode<T>>
  ): void {
    const _root = root ?? this.root
    const __cb__: TraversalExcutor<T> = (node) =>
      this.exc(node, cb || this.executor)

    if (is_null(_root)) return

    const visitor = new Map<string, boolean>()
    try {
      this.primary_traversal(_root as GraphNode<T>, mode, __cb__, visitor)
    } catch (err) {
    } finally {
      visitor.clear()
    }
  }
  un_visit_all(root: IGraphNode<T>) {
    if (root == null) return
    const children = root.children as GraphNode<T>[]
    root.un_visit()

    for (const node of children) {
      if (node.visited) {
        this.un_visit_all(node)
      }
    }
  }
  private primary_traversal(
    root: GraphNode<T>,
    mode: SearchMode,
    __cb__: TraversalExcutor<T>,
    visitor: Map<string, boolean>
  ): boolean {
    //if root not exist
    if (root === null) return true
    const children = root.children as GraphNode<T>[]
    //visit root enterd in search
    visitor.set(root.key as string, true)
    //[Bearth First Seach] First  Visit Child Of root
    if (mode === SearchMode.BFS) {
      //First visit root
      if (this.root === root) __cb__(root)
      //visit childs of root
      for (const node of children) __cb__(node)
    }
    //[Depth First Search] See each node at the moment of meeting
    else if (mode === SearchMode.DFS || mode === SearchMode.PRE_ORDER)
      __cb__(root)
    //[In Order Traversal]
    else if (mode === SearchMode.IN_ORDER && root.children.length === 0)
      __cb__(root)

    //seach for all child not visited
    for (const node of children) {
      //Check the node if it was not visited
      if (visitor.has(node.key as string)) continue
      //search children not visited node
      this.primary_traversal(node, mode, __cb__, visitor)
      //[In Order Traversal] first back track on child,root must visit
      if (mode === SearchMode.IN_ORDER && !root.visited) __cb__(root)
    }
    //[Post Order Traversal] Seach When Node Visit End
    if (mode === SearchMode.POST_ORDER) __cb__(root)

    return true
  }
  pruning(): void {
    throw new Error('Method not implemented.')
  }

  clear(): void {
    this.root == null
  }
}
