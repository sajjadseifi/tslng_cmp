export * from './parser-rd'
// var lalr = require('libcore-parser-lalr')
// console.log('sajjad seifi')

// var parser = lalr.define(
//   'Expr', // Root production
//   [
//     // Lexical grammar
//     '+',
//     [/\+/],
//     '*',
//     [/\*/],
//     '(',
//     [/\(/],
//     ')',
//     [/\)/],
//     'number',
//     [/(\+|\-)?[0-9]+(\.[0-9]+)?/],
//     'whitespace',
//     [/[ \r\n\t]+/],
//     'identifier',
//     [/[a-zA-Z\_\$][a-zA-Z0-9\_\$]*/],
//     // Grammar rules
//     'Expr',
//     ['Ass'], // 1:Expr rule
//     // 2:Ass rule // 1:Ass rule
//     'Ass',
//     ['Add', ['identifier', /\=/, 'Ass']],
//     // Add1 rule// Add2 rule
//     'Add',
//     ['Mul', ['Add', '+', 'Mul']],
//     // Mul1 rule// Mul2 rule
//     'Mul',
//     ['Unit', ['Mul', '*', 'Unit']],
//     'Unit',
//     ['number', ['(', 'Expr', ')']]
//     // Unit1 rule// Unit2 rule
//   ],
//   // ignore these tokens
//   ['whitespace']
// )

// var iterator = parser.iterator()
// var lexeme

// // set string subject to parse
// iterator.set('1 + 2 * 3 + 5')

// // iterate
// lexeme = iterator.next()

// for (let prv = iterator.next(); prv; prv = iterator.next()) {
//   lexeme = prv
//   console.log(
//     lexeme.name, // grammar rule name
//     lexeme.rule, // grammar rule id (e.g. Mul1, Unit2)
//     lexeme.value // lexeme value - you update this with lexeme.update("value")
//     // lexeme.reduceCount,     // number of lexemes popped to reduce
//     // lexeme
//   )
// }
