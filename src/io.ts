import fs from 'fs'
export type FD = number

export const read_async = (path: string): Promise<FD> => {
  return new Promise((resolve, reject) => {
    console.log(path)
    fs.open(path, 'r', (err, fd) => {
      console.log({ fd })
      if (err) reject(err)
      resolve(fd)
    })
  })
}
