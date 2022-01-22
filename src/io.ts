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
export const create_file_or_clear=(path: string):Promise<FD>=>{
  return new Promise((resolve, reject) => {
    fs.open(path, 'w+', (err, fd) => {
      if (err) reject(err)

      fs.writeFile(fd,"",{},()=>{});
      
      resolve(fd)
    })
  })
}
export const write=(fd:number,txt:string)=>{
  fs.appendFileSync(fd,txt,{})
}

export const read_range=(fd:FD,start:number,end:number):string => {
  const length = end-start
  const offset = start
  const buffer = Buffer.alloc(length)

  fs.readSync(fd,buffer,0,length,offset);
  return buffer.toString('utf8');
}

export const append_file_to_file=(org:FD,tar:FD):boolean=>{
  const buffer = Buffer.alloc(1);
  let  data = "";
  let c=0;

  while(fs.readSync(org,buffer, 0, 1,c++))
    data += buffer.toString('utf8')
  
  write(tar,data);

  return true
}