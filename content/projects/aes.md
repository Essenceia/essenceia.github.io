---
title: "AES 128b"
description: "RTL implementation of the AES 128 encoder and decoder."
summary: "Learn more about me and why I am starting this blog."
tags: ["rtl", "verilog", "cryptography", "aes"]
date: 2023-07-30
draft: false
---
# Introduction

The Advanced Encryption Standard ( AES ) is a widely used block cipher encryption algorithm.
One of my past projects called for the RTL implementation of a version of aes for both 
encoding and decoding. 
This blog post is a presentation of this project.

## Adcanced Encryption Standard ( AES )

Before we begin here is a quick introduction of AES :

> The AES algorithm is a symmetric block cipher that can encrypt (encipher) and decrypt (decipher) information.
Encryption converts data to an unintelligible form called ciphertext; decrypting the ciphertext
converts the data back into its original form, called plaintext.

> The AES algorithm is capable of using cryptographic keys of 128, 192, and 256 bits to encrypt
and decrypt data in blocks of 128 bits. These different “flavors” may be referred to as “AES-128”, “AES-192”, and
“AES-256”.

Our implenetation called for the AES-128 flavor.

## Overview of AES

As mentioned earlier AES is a block cypher algorythme, each round it will take in a data block and a
key and output a new version of a data block and key. Both the key and the data will be updated each round.

The key size specifies the number of rouds, there are 10 rounds for a 128 bit key, 12 rounds for the 192 bit key and 14 rounds for the 256 key.

### Encrypting the data 

For encrypting the plain text data into to cyphertext, data block is encrypted by 
passing the though the following functions : 
`SubBytes`, `ShiftRows`, `MixColumns` and `AddRoundKey`. 

{{< figure
    src="aes_arch.png"
    alt="block calculation"
    caption="The basic AES-128 cryptographic architecture, credit [Arrag, Sliman & Hamdoun, A. & Tragha, Abderrahim & Khamlich, Salaheddine](https://www.researchgate.net/publication/230853805_Design_and_Implementation_A_different_Architectures_of_mixcolumn_in_FPGA)"
    >}}

For the inital round, we will only performs the `AddRoundKey` function, for the middle rounds all the functions will be performed
and for the final round we will only performs the `SubBytes`, `ShiftRows` and `AddRoundKey` functions.

Internally the 16 bytes of the data are mapped onto a 4x4 byte matrix, as such will be refering to _rows_ and 
_collumns_ latter in this article.
 
{{< figure
    src="aes_in_matrix.png"
    alt=""
    caption="Input byte data mapping onto a 4x4 byte matrix"
    >}}

We will go in depths into these functions later in the article.

### Key scheduling 

For encruption each round a new key is created based on the value of the previous rounds key and what round we are performing.
This is called "expanding" the key and, the algorithm that creats this new key for each round is called the `Key Scheduale`.

The new key is obtained by passing the first 4 byte collumn of the old key though the following
funcitons `RotWord`, `SubWord`, `Rcon` and then `xor`'ing the result with the 4 bytes of our last collumn
and then propagating this back through all the columns.

{{< figure
    src="ks.svg"
    alt="key schedualing"
    caption="AES key schedualing for 128-bit key, credit [By Sissssou - Own work, CC BY-SA 4.0](https://commons.wikimedia.org/w/index.php?curid=54091435)"
    >}}

### Decryption overview
 
The AES algorithme can be inversed to performe the decoding operations. This is done by implementing
 the cipher transforms in reverse order.

## Ressources

If this article left you craving a more in depth explaination of the AES algorythme, would stongly I suggest reading the exellent writeup on the 
topic at the [braincoke](https://braincoke.fr/) blog. They have articles coverening :

- [encryption](https://braincoke.fr/blog/2020/08/the-aes-decryption-algorithm-explained/#the-inverse-cipher), 

- [decryption](https://braincoke.fr/blog/2020/08/the-aes-decryption-algorithm-explained/#the-inverse-cipher) 

- [key schedulaing](https://braincoke.fr/blog/2020/08/the-aes-key-schedule-explained/).

Official AES specification, link to pdf : [Federal Information Processing Standard Publication 197 - Specification fo the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf)

# Encryption



## `SubBytes`

The `SubBytes` function is a byte substitution bases on an substition table called an `S-box`.

Each of the 16 bytes of the data will be substituted for it's equivalent byte in the `S-box`.

{{< figure
    src="sbox_sub.png"
    alt=""
    caption="SubBytes applies the S-box to each byte of the data"
    >}}
   
The substitution table is as follows with the `x` and `y` indexes corresponding to the hexadecimal
value of the `xy` data to be substituted.

{{< figure
    src="sbox.png"
    alt=""
    caption="S-box : subsition values for the byte `xy` ( in hexadecimal format )."
    >}}

 
Most implentations will store this table in memory, access it undering the value for the 
byte needing substituation as an offset and then substitute it using the result of the read.
Becuase we are implementing this functionality in hardware and would like each rounds to only take 1 cycle we would have
needed to implement 16 memories, 256 entries deep and 8 bits wide to perform this operation in parallel.
As such, we looked for a more effifcient way.


Turns out the sbox logic can be simplified by brute forcing it with logic reduction, which is
exactly what `todo source` did at `todo source`. The result was posted to `todo source` and 
we simply converted this to verilog. 

The result is far from humanly readable but the 
produced output matches up perfectly with the substituation table and is much cheaper in 
logic. 

Link to implementation : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/sbox.v)

## `ShiftRows`

The `ShiftRows` function performes a left cyclical byte shift of the data rows with an offset based on the row's index.

{{< figure
    src="aes_shift_row.png"
    alt=""
    caption="Cyclical left shift of the data rows"
    >}} 

This transformation of the data mapes onto hardware very well.

## `MixColumns`

Unlike what this transform's name might suggest this step isn't as simple as a shuffeling of collumns.

{{< figure
    src="aes_mix_columns.png"
    alt=""
    caption="Transform operates on the data column-by-column"
    >}}
Rather, this transform takes each 4 bytes collumn and treats them as a 4 term polynomial.
This plolynomical is then multiplied with a predetermined 4x4 matrix.

{{< figure
    src="mixw_0.png"
    alt="mixw"
>}}
{{< figure
    src="aes_mixw.png"
    alt="mixw"
    caption="Mix column matrix multiplication, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
>}}


The catch here is that these operations are done in a Galois field, as such the definition of operations 
such as "multiplication" and "addition" are different.

{{< figure
    src="aes_mixw_math.png"
    alt="mixw"
    caption="Galois field arithmetic, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
    >}}

Because we are dealing with Galois field arithemetics all these operations can be implemented using
_xor_ gates. 

Link to implementation : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/mixw.v) 


## `AddRoundKey`

This transform is simuly a _xor_'ing between each data collumn and the corresponding collumn of this
round's key. 

{{< figure
    src="aes_add_rnd_key.png"
    alt="mixw"
    caption="_xor_ each column of the data with the corresponding column of the key, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
    >}}

The key obtained as a result of the key shedulaing transform for each round.

# Implementation of AES-128 


This implementation included both the full encryption and decryption path witten in synthesizable RTL.
The encryption/decryption takes place over multiple cycles inline with the aes's rounds. In the case of
aes128 it take 10 cycles for the module to produce an output.

![Wave overview of aes128 encryption simulation!](aes_enc.png "aes128 encryption simulation")

{{< github repo="Essenceia/AES" >}}

## RTL
This synthesizable implementation of AES128 includes two separate designs : one for encryption and another for decryption.
Our implementation breaks down the more difficult rounds of the AES algorithm into there own module, simpler rounds are
performed in the top level. 

Modules :
|    | Encryption      | Decryption |
| -- | --------------- | ----------- |
|Top Level | aes       | iaes    |
|SubBytes| sbox  | isbox      |
|MixColumns | mixw  | imixw      |
|Key Scheduling| ks  | iks  |


### Top 

The top level module contains the main control logic for the aes algorithm.
This module includes :

- FSM keeping track of the aes round we are currently

- flops for the data and key

- flops for the rounds constant  


#### Encryption interface

```
module aes(
	input clk,
	input nreset,
	
	input          data_v_i, // input valid
	input [127:0]  data_i,   // message to encode
	input [127:0]  key_i,    // key
	output         res_v_o,  // result valid
	output [127:0] res_o     // result
	);
``` 

#### Decryption interface
```
module iaes(
	input clk,
	input nreset,
	 
	input          data_v_i, // input valid
	input  [127:0] data_i,	 // message to decode
	input  [127:0] key_i,    // key ( encoded version )
	output         res_v_o,  // result valid
	output [127:0] res_o     // result
	);
```

#### Encryption interface
```
module sbox(
    input  [7:0] data_i,
    output [7:0] data_o
    );
```
#### Decryption interface
```
module isbox(
    input  [7:0] data_i,
    output [7:0] data_o
    );
```

### Mix Columns

This module takes in 4 bytes and treats them as a 4 term polynomial and multiplies them with a predetermined 4x4 matrix.
These operations are done in a Galois field, as such the definition of operations such as "multiplication" and "addition"
is different.

{{< figure
    src="mixw_0.png"
    alt="mixw"
>}}
{{< figure
    src="mixw.png"
    alt="mixw"
    caption="Mix column math, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
>}}

#### Encryption Interface
```
 module mixw(
	input  [31:0] w_i,
	output [31:0] mixw_o
	);
```

{{< figure
    src="imixw.png"
    alt="imixw"
    caption="Inverse mix column math, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
>}}

#### Decryption Interface
```
module imixw(
	input  [31:0] w_i,
	output [31:0] mixw_o
	);
```

### Key scheduling 

This module derives the new 4 byte key and 1 byte round constant (rcon) for the current aes round by taking in the previous round key and rcon. 
Internally this module also calls on the sbox module during operations on the higher order byte.

encryption : 

{{< figure
    src="ks.png"
    alt=""
    caption="Key schedualing, credit [braincoke](https://braincoke.fr/assets/static/aes_key_schedule.c19ed0b.1014f4f1d84001bbc9fa65f65a2a9ee7.png)"
>}}

#### Encryption interface
```
module ks(
	input  wire [127:0] key_i,
	input  wire [7:0]   key_rcon_i,
	output wire [127:0] key_next_o,
	output wire [7:0]   key_rcon_o
	);
```
#### Decryption interface
```
module iks(
	input  wire [127:0] key_i,
	input  wire [7:0]   key_rcon_i,
	output wire [127:0] key_next_o,
	output wire [7:0]   key_rcon_o
	);
```

## Test bench

This project includes a dedicated test bench for all major module. 
The top level test benches is the most complete and the main tool for testing this design.
Our testing is performed by comparing the design's output to the output of our golden model.

Test bench files :
|    | Encryption      | Decryption |
| -- | --------------- | ----------- |
|top | top\_test.vhd   | itop\_test.vhd  |
|sbox| sbox\_test.vhd  | isbox\_test.vhd      |
|mix columns | mixw\_test.vhd  | imixw\_test.vhd      |
|key scheduling| ks\_test.vhd  | iks\_test.vhd  |


### Top 

This implementation's correctness is tested by comparing, for a given input, the output produced
by the rtl and a golden model implemented in C. 

Located in the `tv/` folder is an implementation of aes in C produced a number of random data and keys and 
computes the encoded output data and last round keys. Each of these values is written to file using ascii
in a binary representation from msb to lsb, and using one line per vector. 

Output files :

- `aes_enc_data_i.txt` input data for encryption

- `aes_enc_key_i.txt` input for encryption

- `aes_enc_data_o.txt` encrypted data

- `aes_enc_key_o.txt` key at the last round of the encryption

By default these files should be populated with 10 unique test vectors so
there is no requirement for users to run the model.

#### Generating new test vectors

To generate new test vectors we first need to compile our C AES code and run the resulting program.

```
make aes
./aes
```

( optional ) To build with debug :
```
make aes debug=1
```

##### Configuration 

Users can configure the generation of test vector using the following macro's "

- `TEST_NUM`  number of test vectors to be generated, located in `main.c`, default value is `10`

- `FILE_STR` array of file names to which the test vectors are written, located in `file.h`, default value is `{"aes_enc_data_i.txt","aes_enc_key_i.txt","aes_enc_res_o.txt", "aes_enc_key_o.txt"}`

##### aes.h

This aes implementation was originally written by Dani Huertas and Nikita Cartes and
can be found at [https://github.com/dhuertas/AES](https://github.com/dhuertas/AES) 
