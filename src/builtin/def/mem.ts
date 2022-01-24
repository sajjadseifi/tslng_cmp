
proc gbblk9
	mov r1,8
    sub r0,r0,r1
    ret
proc gbget9
	call rcblk,r0
    ld r0,r0
    ret
proc gbset9
	mov r2,1
    mov r3,r0
    call rcget,r3
    call rcblk,r0
    st r3,r1
    mov r0,r3
    ret
proc gbinc9
	mov r2,1
    mov r3,r0
    call gbget,r3
    jz r1,rcinc_add
    sub r3,r3,r1
    jmp rcinc_end
    rcinc_add:
    add r3,r3,r1
    rcinc_end:
    call rcblk,r0
    st r3,r0
    mov r0,r3
    ret
proc malloc9
	mov r1,0
    mov r2,8
    mov r3,r2
    call mem,r3
    add r0,r0,r2
    call mem,r0
    st r2,r0
    add r0,r0,r2
    st r0,r3
    mov r0,r3       
    ret
proc dealloc9
	mov r1,0
    ld r3,r0
    mov r5,r3
    call gbget,r3
    call rel,r0
    cmp= r6,r4,r1
    jz r6,dealloc_out 
    call rel,r3
    dealloc_out:
    mov r0,r5
    ret