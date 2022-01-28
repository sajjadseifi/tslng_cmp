import { IDENTIFIER, NUMERIC } from "src/constants/pattern"

export const isiden = (iden:string)=> IDENTIFIER.test(iden)

export const isnum = (num:string)=> NUMERIC.test(num)

export const isreg = (reg:string)=> reg[0] == "r"

export const tonum = (str:string) : number => +str

export const regc = (r:string)=> tonum(r.substring(1,r.length))
