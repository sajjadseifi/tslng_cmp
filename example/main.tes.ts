
proc find:
	mov r0,0
	mov r8,0
	mov r7,r8
	mov r9,10
	mov r10,0
	mov r11,1
lab1:
	com<= r10,r10,r9
	jz r10,lab2
	add r10,r10,r11
	com= r12,r6,r10
	mov r0,r7
	ret
	mov r13,1
	add r14,r7,r13
	mov r7,r14
	mov r15,1
	mov r7,r15
	mov r16,1
	add r17,r7,r16
	mov r18,5
	mul r19,r7,r18
	jz r7,lab3
	mov r20,17
lab3:
	jmp lab4
	mov r20,19
lab4:
	mov r21,1
	mov r0,r21
	ret
	jmp lab1
lab2:
proc main:
	mov r0,0
	mov r24,5
	mov r1,r24
	call createArray,r1
	mov r22,r0
	mov r5,r22
	mov r25,5
	mov r6,r25
	call find,r5,r6
	mov r23,r0
	mov r3,r23
	call printInt,r3
	mov r26,0
	mov r0,r26
	ret
_exit: