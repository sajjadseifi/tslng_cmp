
proc createArray5
	mov r1,8
    mul r2,r1,r0
    add r2,r2,r1
    call mem,r2
    st r0,r2
    mov r0,r2
    ret
proc arrayLength5
	ld r0,r0
    ret