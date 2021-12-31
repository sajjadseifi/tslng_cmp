import { Compiler } from './compiler'

export const main = () => {
  const compiler = new Compiler()
  compiler.run()
}

// let complex = 0
// const fp = 0
// const lock = undefined
// const MAX_THREAD_COUNT = 20
// const OFFSET = ((7 * (6 + 4)) / 2) * 100

// const new_read_pos = (t) => {
//   let start = 0
//   aquire(lock)
//   start = complex
//   complex += OFFSET
//   relaese(lock)

//   read_thread(t, start)
// }

// const read_thread = (thrd, start) => {
//   skeeg(fp, start)
//   //skeep to find new line
//   while (!eof && getch(fp) != '\n');

//   while (!eof && file_pos > start + OFFSET) {
//     line = fgets(fp)
//     prog(line)
//   }
//   if (!eof) new_read_pos(t)
// }
