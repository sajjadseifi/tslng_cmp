import { Nullable } from 'src/types'
import { is_null } from 'src/utils'

export type Key = number
export type Value<T> = T

export enum SearchMode {
  PRE_ORDER,
  IN_ORDER,
  POST_ORDER,
  BFS,
  DFS
}
export type TraversalExcutor<T> = (node: IGraphNode<T>) => boolean

export interface IGraphNode<T> {
  key: Key
  value: Value<T>
  children: IGraphNode<T>[]
  visited: boolean
  is_child(key: Key): boolean
  get_child(key: Key): Nullable<IGraphNode<T>>
  rm_child(key: Key): Nullable<IGraphNode<T>>
}

export interface IGraph<T> {
  add_generic(value: Value<T>, pkey: Key): Nullable<IGraphNode<T>>
  add_by_key(ckey: Key, pkey: Key): Nullable<IGraphNode<T>>
  add(node: IGraphNode<T>, parent: IGraphNode<T>): Nullable<IGraphNode<T>>
  rm(node: IGraphNode<T>): Nullable<IGraphNode<T>>
  rm_by_key(key: Key): Nullable<IGraphNode<T>>
  search(node: IGraphNode<T>): Nullable<IGraphNode<T>>
  search_by_key(key: Key): Nullable<IGraphNode<T>>
  parents(key: Key | IGraphNode<T>): IGraphNode<T>[]
  traversal(
    root: IGraphNode<T>,
    mode: SearchMode,
    cb?: TraversalExcutor<T>
  ): void
  clear(): void
}

export class GraphNode<T> implements IGraphNode<T> {
  children: IGraphNode<T>[]
  visited: boolean
  constructor(public key: number, public value: T) {
    this.visited = false
    this.children = []
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
    if (this.children.some((c) => c.key === child.key)) return
    //if dont exist add to childs
    this.children.push(child)
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

export class Graph<T> implements IGraph<T> {
  private uniq_key: number
  root: Nullable<IGraphNode<T>>
  logging: boolean = false

  constructor(public executor: TraversalExcutor<T>, public generic?: boolean) {
    this.uniq_key = 0
    this.root = null
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

    if (parent === null) return null

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
  add_by_key(ckey: number, pkey: Key): Nullable<IGraphNode<T>> {
    const parent = this.search_by_key(pkey)

    if (parent === null) return null

    const node = this.search_by_key(ckey)

    if (node == null) return null

    this.add(node, parent)

    return node
  }
  add(node: IGraphNode<T>, parrent: IGraphNode<T>): Nullable<IGraphNode<T>> {
    const p = parrent as GraphNode<T>

    p.add_child(node)

    return node
  }
  rm(node: IGraphNode<T>): Nullable<IGraphNode<T>> {
    const _node = this.search(node)

    if (_node === null) return null

    return this.rm_by_key(_node.key)
  }
  rm_by_key(key: Key): Nullable<IGraphNode<T>> {
    const node = this.search_by_key(key)
    if (node) {
      //find parretns
      const prs = this.parents(key)
      //rm child on parrent
      prs.forEach((p) => p.rm_child(key))
    }
    return node
  }
  parents(key: Key | IGraphNode<T>): IGraphNode<T>[] {
    const prs: IGraphNode<T>[] = []
    const _key: Key = typeof key === 'number' ? key : key.key
    this.traversal(
      //root ndoe
      this.root,
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

    this.traversal(this.root, SearchMode.BFS, (root) => {
      if (root !== node) return true

      exist = root
      return false
    })

    return exist
  }
  search_by_key(key: Key): Nullable<IGraphNode<T>> {
    let exist = null

    this.traversal(this.root, SearchMode.BFS, (root) => {
      if (root.key !== key) return true

      exist = root
      return false
    })

    return exist
  }

  traversal(
    root: Nullable<IGraphNode<T>>,
    mode: SearchMode,
    cb?: TraversalExcutor<T>
  ): void {
    const __cb__: TraversalExcutor<T> = (node) => this.exc(node, cb)
    const _root = root ?? this.root
    //
    if (is_null(_root)) return
    //
    try {
      //
      this.primary_traversal(_root as GraphNode<T>, mode, __cb__)
    } finally {
      // becuse all node is visited
      if (mode === SearchMode.IN_ORDER) this.un_visit_all(root!)
    }
  }
  private un_visit_all(root: IGraphNode<T>) {
    const children = root.children as GraphNode<T>[]

    for (const node of children) {
      if (!node.visited) continue

      node.un_visit()

      this.un_visit_all(node)
    }
  }
  private primary_traversal(
    root: GraphNode<T>,
    mode: SearchMode,
    __cb__: TraversalExcutor<T>
  ): boolean {
    //if root not exist
    if (root === null) return true

    const children = root.children as GraphNode<T>[]
    //visit root enterd in search
    if (mode !== SearchMode.IN_ORDER) root.visit()
    //[Bearth First Seach] First  Visit Child Of root
    if (mode === SearchMode.BFS) {
      //First visit root
      if (this.root === root) __cb__(root)
      //visit childs of root
      for (const node of children) __cb__(node)
    }
    //[Depth First Search] See each node at the moment of meeting
    if (mode === SearchMode.DFS || mode === SearchMode.PRE_ORDER) __cb__(root)

    //[Pre Order Traversal] First visit root
    if (mode === SearchMode.POST_ORDER && root == this.root) __cb__(root)
    //seach for all child not visited
    for (const node of children) {
      //Check the node if it was not visited
      if (node.visited) continue
      //search children not visited node
      this.primary_traversal(node, mode, __cb__)
    }
    //[Post Order Traversal] Seach When Node Visit End
    if (mode === SearchMode.POST_ORDER) __cb__(root)
    //un visit root for the observed node and end of traversal
    if (mode === SearchMode.IN_ORDER) {
      root.visit()
      __cb__(root)
    } else root.un_visit()

    return true
  }

  clear(): void {
    this.root == null
  }
}
