
proc main
	mov r0,10
	mov r1,r0
	mov r4,1
	mov r2,0
L1:
	cmp<= r3,r2,r1
	jz r3,L2
	mov r5,2
	mod r6,r2,r5
	mov r7,0
	cmp= r8,r6,r7
	mov r9,r8
	jz r9,L3
	mov r11,r2
	mov r12,r11
	call printInt11,r12
	mov r13,r12
L3:
	add r2,r2,r4
	jmp L1
L2:
	mov r15,10
	mov r16,r15
	mov r17,r16
	call printc11,r17
	mov r18,r17
	mov r19,10
	mov r20,r19
	mov r23,1
	mov r21,0
L4:
	cmp<= r22,r21,r20
	jz r22,L5
	mov r24,2
	mod r25,r21,r24
	mov r26,1
	cmp= r27,r25,r26
	mov r28,r27
	jz r28,L6
	mov r29,r21
	mov r30,r29
	call printInt11,r30
	mov r31,r30
	mov r32,10
	mov r33,r32
	mov r34,r33
	call printc11,r34
	mov r35,r34
L6:
	add r21,r21,r23
	jmp L4
L5:
	mov r36,0
	mov r37,r36
	mov r0,r37
	jmp L0
L0:
	ret