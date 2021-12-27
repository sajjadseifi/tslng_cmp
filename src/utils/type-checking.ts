import { sym } from '../constants'
import { EpxrType } from '../types/parser'

export const same_type = (type1: EpxrType, type2: EpxrType) => type1 === type2

export const is_array = (type: EpxrType) => type === sym.ARRAY

export const is_int = (type: EpxrType) => type === sym.INT

export const is_nil = (type: EpxrType) => type === sym.NIL

export const is_empty = (type: EpxrType) => type === -1
