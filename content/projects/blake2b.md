---
title: "BLAKE 2B"
description: "Partial RTL implementation of the BLAKE-2B encoder and decoder."
summary: "Learn more about me and why I am starting this blog."
tags: ["rtl", "verilog", "cryptography", "blake2"]
draft: false
---
# Introduction

In this project we implemented a lite version of the BLAKE2 cryptographic hash function into
synthetisable RTL.
{{< figure
    src="blake2b_wave.png"
    alt=""
    caption="BLAKE2b hash simulation result, it takes 12 cycles to produce a result for one block"
    >}}

{{< github repo="essenceia/blake2" >}}

# `BLAKE2`


BLAKE2 is specified in [RFC7693](https://tools.ietf.org/html/rfc7693) and is a function takes in plaintext data, called the `digest`, and produces a `hash` of 16 or 32 bytes. 

In practice `BLAKE2` is used in different applications from password hashing to proof of work
for cryptocurrencies.

There are 2 main flavors of BLAKE2:


| flavor | digest size ( bytes ) | internal operation size ( bytes ) | hash size ( bytes ) |
| ------ | --------------------- | --------------------------------- | ------------------- |
| `BLAKE2b` | 1 to 63 | 64 | 32 | 
| `BLAKE2s` | 1 to 32 | 32 | 16 | 


Our code is written in a parametric fashion as to support both the 64B (b) and 32B (s) version.

This hash function may work on individual blocks of data or on data streams.

{{< alert icon="fire" cardColor="#e63946" iconColor="#1d3557" textColor="#f1faee" >}}
This code was written to be configured as both the
b and s variants, but **only the b variant has been thougrougly tested thus far**.
{{< /alert >}}

{{< alert >}}
This implementation does not currently support secret keys or streaming data to be compresse: it
only acccepts one block at a time.
{{< /alert >}}

## Function overview

The main function in `BLAKE2` is called the `compression function`, it takes the 
{{< mermaid >}}
flowchart TD


subgraph BLAKE2
B-->I[for each message block]
F-->G[end for]
I-->J;
G-->I

    subgraph Compression
    J[Init block]-->E[for i=0..N];
    E-->C[Permulation];
    C-->D[Mixing];
    D-->F[end for];
    F-->E;
    end

end

A(Plaintext)-->B[Init];
G-->H(Hash);

click B "#init" _blank
click C "#permulation function" _blank
click D "#mixing function" _blank
click G "#end" _blank
{{< /mermaid >}}

## `Init`

## `Permutation` function

## `Mixing` function

## `End` 


## RTL

### blake2 hash  

As blake2 module was written in a paramettric fashion to be configured for both the 64B (b) and 32B (s) versions
of blake2 we implement a wrapper used to pass on the correct configuration.

- `blake2b_hash512` configures for the 64B blake2b version

- `blake2s_hash256` configured for the 32B blake2s version

Blake2b module interface :
```
module blake2b_hash512(
	input clk,
	input nreset,
	input          valid_i,
	input [1023:0] data_i,
	output         hash_v_o,
	output [511:0] hash_o // Seed, output of the hast512
	);
```

Blake2s module interface :
```
module blake2s_hash256(
	input          clk,
	input 	       nreset,

	input 	       valid_i,
	input  [511:0] data_i,
	output         hash_v_o,
	output [255:0] hash_o
	);
```

### blake2

This is the main module for the blake2 hash, by default the parameters are configured for the `b` variant of blake2.

Module interface and parameters :
```
module blake2 #( 
	 parameter NN     = 64, // output hash size in bytes, hash-512 : 64, hash-256 : 32 
	 parameter NN_b   = 8'b0100_0000, // hash size in binary, hash-512 : 8'b0100_0000, hash-256 : 8'b0010_0000
	 parameter NN_b_l = 8, // NN_b bit length 
	 parameter W      = 64,// bits in word
	 parameter DD     = 1, // dd, number of message blocks
     parameter LL_b   = { {(W*2)-8{1'b0}}, 8'b10000000},// input size in bytes
	 parameter R1	  = 32, // rotation bits, used in G
	 parameter R2	  = 24,
	 parameter R3	  = 16,
	 parameter R4	  = 63,
	 parameter R 	  = 4'd12 // number of rounds in v srambling
	)(
	input                 clk,
	input                 nreset,

	input 	              valid_i,
	input [(W*16*DD)-1:0] data_i,
	output                hash_v_o,
	output [(NN*8)-1:0]   hash_o // Seed, output of the hash512
	);
```

### right\_rot 

This module performs a right circular rotation, the size of the input vector `W`, and the number of shifts `ROT_I` are set
as parameters. 

```
module right_rot #(
	parameter ROT_I=32,
	parameter W=64
	)
	(
	input  [W-1:0] data_i,
	output [W-1:0] data_o
	);
	assign data_o[W-1:0] = { data_i[ROT_I-1:0], data_i[W-1:ROT_I]};
endmodule
```

### adder\_3way

This module performs a 3 way addition and returns the result. Both carries are disgarded, as the mixing function in which this 3 way add 
is used doesn't call for them, as such input and output vectors have the same length.
This lenght is defined by the parameter `W`.

Module interface and paramters :
```
module addder_3way #(
	parameter W=64
	)
	(
	input [W-1:0] x0_i,
	input [W-1:0] x1_i,
	input [W-1:0] x2_i,
	
	output [W-1:0] y_o
	);
```

## Test bench

Out test bench includes 2 parts :

`blake2_test.vhd`, written in VHDL.
Test's the correctness of this blake2's RTL implementation as well as 
checking no unexpected `X`'s are produced by our module.

`test_vector`, written in C
Uses the official blake2 software implementation as our golden model to
generate test vectors and writes them into files.
        

RTL's output correcteness is checked against multiple test vectors read from files.
If, for a given input the output doesn't match an assert will be fired with a
severity of `failure` and the simulation will be stopped.
Pre-generated vectors are shipped with this repository and can be found in the
`test_vector` folder.
To generate a new random set of test vectors, the code is also contained in the
same folder.

Test vector files :

`*_data_i.txt` : data to be hashed

`*_hash_o.txt` : expected result

### Generate new test vector

External dependancies : libb2's `blake2b.o`

To generate a new test vector, build the C code and run :

```
make clean
make
./blake2
```

(optional) to build with debug :
```
make debug=1
```

The test vector will be directly written to the output files.

### Modify test vectors

The produced test vectors can be modified via macro's in `main.c` :

`TEST_NUM` number of test vectors produced, default is 10

`IN_SIZE` hash input size in bytes, default is 128

`OUT_SIZE` hash output size in bytes, default is 64



