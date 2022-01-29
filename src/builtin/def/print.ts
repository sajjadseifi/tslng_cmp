
proc printInt11
	call iputi,r0
    ret
proc printc11
	call iputc,r0
    ret
proc printString11
	mov r2,1
    mov r3,8
    ld r1,r0           # size of str
nexch:
    cmp>= r2,r1,r2     # n >= (r2=1)
    jz r2,out          # r2 == 0 jump to end
    mov r0,r0,r3       # next cell
    call printChar,r0  # print ch
    sub r1,r1,r2       # n--;
out:
    ret