
proc printArray3
	mov r3,r0
	mov r4,r3
	call arrayLength5,r4
	mov r1,r4
	mov r5,r4
	mov r7,91
	mov r8,r7
	mov r9,r8
	call printc11,r9
	mov r10,r9
	mov r11,r0
	mov r14,1
	mov r17,8
	mov r15,r11
	ld r15,r15
	mov r16,r11
L4:
	cmp>= r13,r15,r14
	jz r13,L5
	sub r15,r15,r14
	add r16,r16,r17
	ld r12,r16
	mov r19,r12
	mov r20,r19
	call printInt11,r20
	mov r21,r20
	mov r22,1
	sub r23,r1,r22
	mov r1,r23
	mov r24,r23
	mov r25,0
	cmp> r26,r1,r25
	jz r26,L6
	mov r28,44
	mov r29,r28
	mov r30,r29
	call printc11,r30
	mov r31,r30
	mov r27,31
	jmp L7
L6:
	mov r32,0
	mov r33,r32
	mov r27,33
L7:
	mov r34,r27
	jmp L4
L5:
	mov r35,93
	mov r36,r35
	mov r37,r36
	call printc11,r37
	mov r38,r37
L3:
	ret

proc main
	mov r0,102
	mov r1,r0
	mov r2,r1
	call printc11,r2
	mov r3,r2
	mov r4,105
	mov r5,r4
	mov r6,r5
	call printc11,r6
	mov r7,r6
	mov r8,98
	mov r9,r8
	mov r10,r9
	call printc11,r10
	mov r11,r10
	mov r12,58
	mov r13,r12
	mov r14,r13
	call printc11,r14
	mov r15,r14
	call getInt9,r17
	mov r16,r17
	mov r18,r17
	mov r21,r16
	mov r22,r21
	call createArray5,r22
	mov r19,r22
	mov r23,r22
	mov r25,10
	mov r24,r25
	mov r26,r25
	mov r27,r24
	mov r28,r24
	mov r29,r16
	mov r30,r19
	mov r31,r29
	mov r32,r30
	call fib17,r31,r32
	mov r16,r31
	mov r33,r31
	mov r35,r19
	mov r36,r35
	call printArray3,r36
	mov r37,r36
	mov r38,0
	cmp= r16,r16,r38
	mov r39,r16
	jz r39,L9
	mov r40,-1
	mul r24,r24,r40
	mov r41,1
	sub r42,r24,r41
	mov r43,r42
	mov r0,r43
	call rel,r19
	jmp L8
L9:
	mov r44,1
	mov r45,-1
	mul r44,r44,r45
	mov r46,r44
	mov r0,r46
	call rel,r19
	jmp L8
L8:
	ret
