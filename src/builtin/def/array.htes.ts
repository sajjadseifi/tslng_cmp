
proc createArray:

    mov r0,0
    st  r0,8
    add r0,r0,r1
    call mem, r0
    ret
proc arrayLength:

    ld r0,r2
    ret