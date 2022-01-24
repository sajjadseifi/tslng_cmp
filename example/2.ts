
proc sumList15
	mov r2,12
	mov r2,r1
	mov r3,10
	mov r6,1
	mov r4,0
L1:
	cmp<= r5,r4,r3
	jz r5,L2
	mov r7,5
	ld r4,r4
	add r8,r4,r7
	mov r8,r1
	add r4,r4,r6
	jmp L1
L2:
	mov r9,0
	ld r1,r1
	cmp= r10,r1,r9
	jz r10,L3
	mov r11,1
L3:
	mov r12,0
	mov r13,1
	mov r14,8
	add r12,r12,r13
	mul r14,r14,r12
	add r14,r14,r0
	mov r0,r1