
proc main
	mov r2,5
	call createArray5,r2
	mov r0,r2
	call arrayLength5,r0
	mov r6,1
	mov r4,0
L1:
	cmp<= r5,r4,r0
	jz r5,L2
	mov r7,1
	mov r8,8
	add r4,r4,r7
	mul r8,r8,r4
	add r8,r8,r0
	call getInt7,
	mov r8,r10
	add r4,r4,r6
	jmp L1
L2:
	mov r13,1
	mov r16,8
	mov r14,r0
	ld r14,r14
	mov r15,r0
L3:
	cmp>= r12,r14,r13
	jz r12,L4
	sub r14,r14,r13
	add r15,r15,r16
	ld r11,r15
	call printInt9,r11
	jmp L3
L4:
	mov r18,0
	mov r0,r18
	jmp L0
L0:
	ret