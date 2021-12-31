import { SubParser } from './parser/types'

export interface IHeaderParser {}
/*
    prog := prog |
            prog func

    func := fc ; |
            fc: ass-body end 
   
    fc := function iden(flist) 

    ass-body := Use ASS-Parser

*/

export class HeaderParser extends SubParser {
  run(): void {
    throw new Error('Method not implemented.')
  }
  prog() {}
  func() {}
}
