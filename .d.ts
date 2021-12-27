declare module 'libcore-parser-lalr' {
  type Parser = {
    set(id: string): void
    iterator(name: any, ...args: any[]): any
  }
  export function define(root: any, definitions: any, exclusions: any): Parser
}
