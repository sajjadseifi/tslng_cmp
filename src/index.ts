import { Compiler, ICompiler } from './compiler'
// import fs from 'fs'
// import { write } from './io'
export const main = () => {
  const compiler: ICompiler = new Compiler()
  compiler.run()

  // fs.open("x.ts","w+",(err,fd)=>{
  //   console.log(err,fd);
  //   fs.writeFile(fd,"",{},()=>{});

  //   write(fd,"proc main:");
  //   write(fd,"\r\n\tadd r0,r1,r1");
  //   write(fd,"\r\n\tadd r1,r1,r1");
  //   write(fd,"\r\n\tsub r2,r0,r5");
  //   write(fd,"\r\n\tret");
  // })

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
