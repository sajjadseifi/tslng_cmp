import { codes } from '../constants'
import { ignored, root, tesGramer } from '../languages/tes/grammar'
const lalr = require('libcore-parser-lalr')

export const praser = () => {
  var parser = lalr.define(root, tesGramer, ignored)
  var iterator = parser.iterator()
  var lexeme
  // set string subject to parse
  // iterator.set(codes.findSolution)
  iterator.set('val Int a')

  // iterate
  lexeme = iterator.next()
  for (let prv = iterator.next(); prv; prv = iterator.next()) {
    lexeme = prv
    const { name, rule, value, reduceCount } = lexeme
    console.log(name, rule, value)
  }
}
