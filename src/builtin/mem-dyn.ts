proc newnode
    mov r1,16
    mov r2,0
    call mem,r1
    st r0,r1
    mov r0,r1
    add r1,r1,r8
    st r2,r1
    ret

proc firstnode
    mov r1,8
    sub r0,r0,r2
    st r0,r0
    ret

proc addfp
    mem r2,8
    call firstnode,r3
addfp_next:
    ld r4,r3
    cmp= r5,r4,r0
    jnz r5,addfp_out
    add r3,r3,r2
    mov r4,r3
    ld r3,r3
    jnz r3,addfp_next
    call newnode,r0
    st r0,r4
addfp_out:
    ret
