
proc out_of_bount7
	ld r2,r0          # size of array
    cmp< r2,r2,r1     # index < size := 1
    jnz  r2,ofb_out   # its ok  
    call exit,r0
ofb_out:
    ret