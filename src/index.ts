import { Lex } from './lex'
import { ILex } from './types'

const main = () => {
  console.log('start main')
  const lex: ILex = new Lex(`
  
    function sajjad() returns Int:
      --is now comment comments
      val sajjad : Int = 10;
    end
  `)
  while (lex.length != 0) {
    lex.get_char()

    if (lex.eof) break

    console.log(lex.ch)
  }
  console.log('end main')
}

main()
