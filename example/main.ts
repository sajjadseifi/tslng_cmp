
proc main
	call createArray5,r0
	st r0,r0
	call sumList15,r0
	mov r5,1
	mov r3,0
L5:
	cmp<= r4,r3,r0
	jz r4,L6
	mov r6,2
	ld r3,r3
	cmp= r7,r3,r6
	jz r7,L7
	mov r8,1
	ld r3,r3
	add r9,r3,r8
	mov r9,r3
L7:
	call printInt11,r3
	add r3,r3,r5
	jmp L5
L6:
	mov r11,0
	mov r0,r11