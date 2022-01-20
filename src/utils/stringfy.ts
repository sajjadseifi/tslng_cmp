export const join_str=(str:any,count:number)=>[...Array(count)].map(()=>str).join("");

export const line = (str:any,count:number=1)=>`${join_str('\r\n',count)}${str}`

export const tab = (str:any,count:number=1)=>`${join_str('\t',count)}${str}`

export const tabline = (str:any) => line(tab(str))