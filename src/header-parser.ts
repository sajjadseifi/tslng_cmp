import { IRunner } from './types'

export interface IHeaderParser {}
/*
    prog := prog |
            prog func

    func :=  function iden(flist); 

    iden := [a-zA-Z][a-zA-Z_0-9]*

*/
export class HeaderParser implements IRunner {
  run(): void {
    throw new Error('Method not implemented.')
  }
  prog() {}
}
