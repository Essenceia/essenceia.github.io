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
This blog post is a presentation of this verilog project.

![Wave overview of aes128 encryption simulation, it take 10 cycles for the module to produce an output!](aes_enc.png "aes128 encryption simulation")

{{< github repo="Essenceia/AES" >}}

:warning: This code wasn't optimized for power, performance, area or side channel hardened.

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

If after rading this article you are left you craving a more in depth explaination of the AES algorythme, would stongly I suggest reading the exellent writeup on the 
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


Turns out the sbox logic can be minimzed though optimization as shown by Boyar and Peralta in there 
2009 paper [A new combinational logic minimization technique with applications to cryptology](https://eprint.iacr.org/2009/191.pdf).
Our s-box is a translation of the circuit they proposed in this paper.

The result is far from humanly readable but the 
produced output matches up perfectly with the substituation table and is much cheaper in 
logic. If in boubt about the logic's equivalence I have written a test bench to test just that : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/sbox_test.vhd) 

Link to implementation : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/sbox.v)

## `ShiftRows`

The `ShiftRows` function performes a left cyclical byte shift of the data rows with an offset based on the row's index.

{{< figure
    src="aes_shift_row.png"
    alt=""
    caption="Cyclical left shift of the data rows"
    >}} 

This transformation of the data mapes onto hardware very well.

This transform doesn't have it's own model and instead is performed within the top level : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/top.v#L79-L95)

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

{{< katex >}}
Because we are dealing with Galois field arithemetics all these operations can be implemented using basic
_xor_ \\(\oplus\\) and _and_ \\(\bullet\\)  gates. 

Link to implementation : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/mixw.v) 


## `AddRoundKey`

This transform is simply an _xor_'ing between each data collumn and the corresponding collumn of this
round's key. 

{{< figure
    src="aes_add_rnd_key.png"
    alt="mixw"
    caption="_xor_ each column of the data with the corresponding column of the key, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
    >}}

The key obtained as a result of the key shedulaing transform for each round.

As this step is quite simple it does have it's own module and is simply performed within
the top level : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/top.v#L113-L117)

## `RotWord`

This transform is part of the key schedule and consists of a simple a one byte left shift cyclical permutation on the last 4 byte column of the
key. 

$$
    [ a_{0}, a_{1}, a_{2}, a_{3} ] \to [a_{1}, a_{2}, a_{3}, a_{0} ]
$$

Link to implementation : [{{<icon "github" >}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/ks.v#L19-L23)

## `SubWord`

The `SubWord` is the key sheduale's equivalent of the data `SubBytes`. It also performes a byte substitiution using the
s-box, but this time on the last 4 bytes of the key column. 

As such, in our implementation we re-use the same s-box module as for the data : [{{< icon "github" >}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/ks.v#L24-L33)

## `Rcon`

This transform involved _xor_'ing the last byte of the last 4 byte collumn of the key with a constant
who's value depends on what round we are currently in. 

For AES-128 rcon takes on the follwing values : 

| round	| 1 | 2	| 3|4|5|6|7|8|9|10|
|-------|---|---|--|-|-|-|-|-|-|--|
| rcon ( hex ) |	8'h01| 8'h02| 8'h04| 8'h08| 8'h10| 8'h20| 8'h40| 8'h80| 8'h1b| 8'h36 |
| rcon ( bin ) |8'b1| 8'b10|  8'b100| 8'b1000| 8'10000| 8'b100000|  8'b1000000| 8'b10000000|  8'b11011| 8'b110110|

Looking at the binary representation we can see a pattern emerge :

- from round 1 to 8 rcon is a 1 bit left shift.

- after round 8 rcon overflows, it's new values get's set to `8'h1b` and the pattern of shifting left by 1 bit continues.

Our implementation of for obtaining the next rcon is based on this simple observation : [{{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/ks.v#L34-L44)

# Decryption

As mentioned earlier, the decoding is simply the inverse of the transforms performed in reverse order.

{{< figure
    src="aes_decryption.png"
    alt=""
    caption="AES-128 decryption, credit [braincoke](https://braincoke.fr/blog/2020/08/the-aes-decryption-algorithm-explained/)"
    >}} 

As such I will not provide any details regarding these steps and simply provide
the links to my implementation of the various transforms :

- [InvSubBytes {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/isbox.v) 

- [InvShiftRows {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/itop.v#L73-L108) 

- [InvMixColumns {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/imixw.v) 

- [InvRotWord {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/iks.v#L42-L46) 

- [InvRcon {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/iks.v#L58-L62) 
 
# Testing 

In order to test the correctness of our aes implementation we are, comparing the result of our
implementation against the output of a golden model codeding in C. For more information on how to 
run the testbench please check out the [README](https://github.com/Essenceia/AES/blob/master/README.md#test-bench).


