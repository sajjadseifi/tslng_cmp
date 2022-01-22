
proc setcb3
	mov r3,10
	mov r3,r0
	mov r4,5
	mov r4,r1
L4:
	ret
proc main
	mov r3,20
	call setcb3,r3,r0,r1
	call createArray5,r2
	st r2,r2
	call sumList13,r2
	mov r6,1
	mov r4,0
L6:
	cmp<= r5,r4,r2
	jz r5,L7
	mov r7,2
	ld r4,r4
	cmp= r8,r4,r7
	jz r8,L8
	mov r9,1
	ld r4,r4
	add r10,r4,r9
	mov r10,r4
L8:
	call printInt9,r4
	add r4,r4,r6
	jmp L6
L7:
	mov r11,0
	mov r0,r11
	jmp L5
L5:
	ret
_exit:
	ret