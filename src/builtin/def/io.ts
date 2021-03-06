
proc open9
	call fop,r0,r1          # file pointer
    mov  r2,r0 
    call fsz,r2             # size
    call stk,r3
    mov r4,8
    add r3,r3,r4
    ld r3,r3
    ld r5,r3                # end of stack file open
    mov r7,0
    mov r8,40               # skip data not to need
    sub r3,r3,r8            # pull back the address bow for the jump
next_open:
    add r3,r3,r8
    cmp< r6,r3,r5
    jz r6,out_open
    ld r6,r3
    cmp= r6,r6,r5
    jz r6,next_open
                            #store
    sub r3,r3,r4            # back to prev for set next data
    call set_nxt_cell,r3,r0 # file pointer
    mov r0,r3               # address of file open pointer
    call set_nxt_cell,r3,r1 # mode file
    call set_nxt_cell,r3,r7 # current pos = 0
    call set_nxt_cell,r3,r2 # end of pos = last index
out_open:
    ret
proc close9
	sub r1,r0
    mov r2,8
    sub r1,r0,r2
    mov r2,0
    call set_nxt_cell,r1,r2 # address = 0
    call set_nxt_cell,r1,r2 # mode file = 0
    call set_nxt_cell,r1,r2 # current pos = 0
    call set_nxt_cell,r1,r3 # end of pos = 0
    mov r0,0 #closed
close_out:
    ret