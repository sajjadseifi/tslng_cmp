import fs from 'fs'
export type FD = number

export const read_async = (path: string): Promise<FD> => {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if (err) reject(err)
      resolve(fd)
    })
  })
}
