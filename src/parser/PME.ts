import { FileExtention } from '../lib/path'
import { Nullable } from '../types'
import { IPME, KeyPME, ParserMode, SubParserTT } from './types'

export class PME {
  private pmes: IPME[]
  constructor() {
    this.pmes = []
  }

  set(parser: SubParserTT, mod: ParserMode, ext: FileExtention): boolean {
    let exist = false
    const key = { mod, ext }

    if (this.exist(key)) {
      console.log(`key ${key} exsit in pms`)
      exist = true
    }

    const pme = { parser, key }

    this.pmes.push(pme)

    return exist
  }
  get(key: KeyPME): Nullable<SubParserTT> {
    const { ext, mod } = key

    return this.pmes.find(this.same_key(mod, ext))?.parser
  }
  get_with_check(
    key: KeyPME,
    checker: (parser: SubParserTT) => boolean
  ): Nullable<SubParserTT> {
    const pm = this.pmes.find((pme) => {
      return checker(pme.parser) && this.same_key(key.mod, key.ext)(pme)
    })

    return pm?.parser
  }
  gets(key: KeyPME): IPME[] {
    const { ext, mod } = key
    return this.pmes.filter(this.same_key(mod, ext))
  }
  exist(key: KeyPME): boolean {
    const { ext, mod } = key

    return this.pmes.findIndex(this.same_key(mod, ext)) != -1
  }
  conflict(k1: KeyPME, k2: KeyPME): boolean {
    return k2.mod === k1.mod && k2.ext === k1.ext
  }
  private same_key(
    mod: ParserMode,
    ext: FileExtention
  ): (pme: IPME, _?: number) => boolean {
    return (pme) => this.conflict(pme.key, { mod, ext })
  }
}
