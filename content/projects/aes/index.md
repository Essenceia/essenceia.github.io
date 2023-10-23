---
title: "AES 128b"
description: "RTL implementation of the AES 128 encoder and decoder."
summary: "Learn more about me and why I am starting this blog."
tags: ["rtl", "verilog", "cryptography", "AES"]
date: 2023-07-30
draft: false
---
# Introduction

The Advanced Encryption Standard (AES) is a widely used block cipher encryption algorithm.
One of my past projects called for the RTL implementation of a version of AES for both 
encoding and decoding. 
This blog post is a presentation of this Verilog project.

![Wave overview of aes128 encryption simulation, it take 10 cycles for the module to produce an output!](aes_enc.png "aes128 encryption simulation")

{{< github repo="Essenceia/AES" >}}

{{< alert >}}
This code wasn't optimized for power, performance, area or hardened against side channel attacks.
{{< /alert >}}
## Advanced Encryption Standard (AES)

Before we begin, here is a quick introduction to the AES algorithm :

> The AES algorithm is a symmetric block cipher that can encrypt (encipher) and decrypt (decipher) information.
Encryption converts data to an unintelligible form called ciphertext; decrypting the ciphertext
converts the data back into its original form, called plaintext.

> The AES algorithm is capable of using cryptographic keys of 128, 192, and 256 bits to encrypt
and decrypt data in blocks of 128 bits. These different “flavors” may be referred to as “AES-128”, “AES-192”, and
“AES-256”.

Our implementation is of the AES-128 flavor.

## Overview of AES

As mentioned earlier, AES is a block cipher algorithm, it encrypts/decrypts over multiple rounds.
Each round will receive a 16 bytes data block and a key, and generate a new version of this data block, as well as a new key for the next round. 

Let's emphasize here that both the key and the data will be updated each round.

The key size determines the number of rounds. There are :
- 10 rounds for a 128 bit key
- 12 rounds for the 192 bit key 
- 14 rounds for the 256 key.

### Encrypting the data 

Encrypting a plaintext data block to ciphertext is done by applying the following transforms : 
`SubBytes`, `ShiftRows`, `MixColumns` and `AddRoundKey`. 

{{< figure
    src="aes_arch.png"
    alt="block calculation"
    caption="The basic AES-128 cryptographic architecture, credit [Arrag, Sliman & Hamdoun, A. & Tragha, Abderrahim & Khamlich, Salaheddine](https://www.researchgate.net/publication/230853805_Design_and_Implementation_A_different_Architectures_of_mixcolumn_in_FPGA)"
    >}}

For the initial round, only the `AddRoundKey` transform is applied.\
For the middle rounds, all the transforms are performed.\
For the final round, only the `SubBytes`, `ShiftRows` and `AddRoundKey` transforms are applied.

We will elaborate more on these transforms later in the article.

Internally the 16 data bytes are mapped onto a 4x4 byte matrix.

In the article, we will be using the **row** and **column** term to refer to the rows and columns of this matrix.
 
{{< figure
    src="aes_in_matrix.png"
    alt=""
    caption="Input byte data mapping onto a 4x4 byte matrix, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
    >}}

### Key scheduling 

During each encryption round, a new key is computed based on the round index, and on the key used during this round.
This is called `Key Expansion`, and the algorithm that creates this new key for each round is called the `Key Scheduler`.

The new key is obtained by passing the last column of the old key though the following
transforms : `RotWord`, `SubWord`, `Rcon`, then `xor`-ing the result with the first column's original value,
and then propagating this back through all the columns.

{{< figure
    src="ks.svg"
    alt="key scheduling"
    caption="AES key scheduling for 128-bit key, credit [By Sissssou - Own work, CC BY-SA 4.0](https://commons.wikimedia.org/w/index.php?curid=54091435)"
    >}}

### Decryption overview
 
The AES algorithm can be inverted to perform the decoding operations. This is done by applying the inverse cipher transforms in reverse order.

# Encryption


## `SubBytes`

The `SubBytes` transform is a byte substitution based on a table called the `S-box`.

Each byte of the 16-bytes data block will be substituted by its `S-box` equivalent.

{{< figure
    src="sbox_sub.png"
    alt=""
    caption="SubBytes applies the `S-box` to each byte of the data"
    >}}
   
The substitution table is as follows with the `x` and `y` indexes corresponding to the hexadecimal
value of the `xy` data to be substituted.

{{< figure
    src="sbox.png"
    alt=""
    caption="S-box : substitute values for the byte `xy` (in hexadecimal format)."
    >}}

Most implementations store this table in memory and access it using the value for the byte to be substituted as an offset.\
Because we are implementing this functionality in hardware and would ideally like each round to only take 1 cycle,
using this method would force us to implement 16 memories, each 256 entries deep and 8 bits wide to perform this operation in parallel. \
To avoid that cost, we looked for a more efficient way.

It turns out that the `S-box` logic can be minimized, as shown by Boyar and Peralta in their 
2009 paper [A new combinational logic minimization technique with applications to cryptology](https://eprint.iacr.org/2009/191.pdf).

Our `S-box` is a translation of the circuit they proposed in this paper.

The result is far from being human readable, but the produced output matches perfectly with the substitution table and is much cheaper logic-wise.

If the reader is as doubtful of the logic's equivalence as I was when I implemented it, he can take a look at [a test bench that I wrote {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/sbox_test.vhd) to verify that equivalence.

[Link to code {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/sbox.v)

## `ShiftRows`

The `ShiftRows` transform performs a left cyclical byte shift of each data row, with an offset based on the row's index.

{{< figure
    src="aes_shift_row.png"
    alt=""
    caption="Cyclical left shift of the data rows : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf)"
    >}} 

This transform is easily implementable in hardware.

[Link to code {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/top.v#L79-L95)

## `MixColumns`

Unlike what this transform's name might suggest, it isn't as simple as shuffling columns.

{{< figure
    src="aes_mix_columns.png"
    alt=""
    caption="Transform operates on the data column-by-column, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf)"
    >}}

This transform takes each column, and treats it as a 4 term polynomial.
This polynomial is then multiplied by a constant 4x4 matrix.

{{< figure
    src="mixw_0.png"
    alt="mixw"
>}}
{{< figure
    src="aes_mixw.png"
    alt="mixw"
    caption="Mix column matrix multiplication, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
>}}


The catch here is that these operations are done in a Galois field and as such, the meaning of the "sum" and "product" operations are not the usual ones.

{{< figure
    src="aes_mixw_math.png"
    alt="mixw"
    caption="Galois field arithmetic, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
    >}}

{{< katex >}}
Because we are dealing with Galois field arithmetics all these operations can be implemented using basic
`xor` \\(\oplus\\) and `and` \\(\bullet\\) operations, and again, translate easily into hardware. 

[Link to code {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/mixw.v) 


## `AddRoundKey`

This transform is a simple `xor` between each data column and the corresponding column of the current round's key. 

{{< figure
    src="aes_add_rnd_key.png"
    alt="mixw"
    caption="`xor` each column of the data with the corresponding column of the key, source : [FIPS-197 Announcing the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf) "
    >}}

The key obtained as a result of the key scheduling transform for each round.

[Link to code {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/top.v#L113-L117)

## `RotWord`

This transform is part of the key scheduling and consists of a simple one byte left cyclical shift (rotation)
of the last column of the key. 

$$
    [ a_{0}, a_{1}, a_{2}, a_{3} ] \to [a_{1}, a_{2}, a_{3}, a_{0} ]
$$

[Link to code {{<icon "github" >}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/ks.v#L19-L23)

## `SubWord`

The `SubWord` is the key scheduling's equivalent of the `SubBytes` step described earlier.
It performs a byte substitution using the `S-box`, but this time on the last column of the key. 

As such, our implementation re-uses the same `S-box` module as the `SubNytes` transform : [{{< icon "github" >}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/ks.v#L24-L33)

## `Rcon`

This transform involves `xor`-ing the last byte of the last column of the key with a constant
whose value depends on the index of the current round.

In AES-128, the constants are the following :

| round	| 1 | 2	| 3|4|5|6|7|8|9|10|
|-------|---|---|--|-|-|-|-|-|-|--|
| constant (hex) |	8'h01| 8'h02| 8'h04| 8'h08| 8'h10| 8'h20| 8'h40| 8'h80| 8'h1b| 8'h36 |
| constant (bin) |8'b1| 8'b10|  8'b100| 8'b1000| 8'10000| 8'b100000|  8'b1000000| 8'b10000000|  8'b11011| 8'b110110|

Looking at the binary representation we can see a pattern emerge :

- from round 1 to 8 `Rcon` is a 1 bit left shift.

- after round 8 `Rcon` overflows, its new value gets set to `8'h1b` and the pattern of shifting left by 1 bit continues.

[Our implementation of for obtaining the next `Rcon` is based on this simple observation {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/ks.v#L34-L44)

# Decryption

As mentioned earlier, the decryption procedure only consists of applying the inverse of the encoding transforms, in reverse order.

{{< figure
    src="aes_decryption.png"
    alt=""
    caption="AES-128 decryption, credit [braincoke](https://braincoke.fr/blog/2020/08/the-aes-decryption-algorithm-explained/)"
    >}} 

The inverted transforms being closely related to the original transforms, we will not elaborate on their behavior in this article.

Though, the interested reader can find their implementations using the following links.

- [InvSubBytes {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/isbox.v) 

- [InvShiftRows {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/itop.v#L73-L108) 

- [InvMixColumns {{<icon "github">}}](https://github.com/Essenceia/AES/blob/master/imixw.v) 

- [InvRotWord {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/iks.v#L42-L46) 

- [InvRcon {{<icon "github">}}](https://github.com/Essenceia/AES/blob/d8d5a44542012e1fc4272c4b85583aab773fdd69/iks.v#L58-L62) 
 
# Testing 

In order to test the correctness of our AES implementation, our test bench compares the result of our
simulation against the output of a golden model coded in C.

For more information, as well as instructions on how to run the test bench, please see the [README](https://github.com/Essenceia/AES/blob/master/README.md#test-bench).

# Resources

If after reading this article, the reader desires a more in depth explanation of the AES algorithm,
I would recommend reading the excellent write-up on this 
topic at [braincoke](https://braincoke.fr/). In particular the articles covering :

- [encryption](https://braincoke.fr/blog/2020/08/the-aes-decryption-algorithm-explained/#the-inverse-cipher), 

- [decryption](https://braincoke.fr/blog/2020/08/the-aes-decryption-algorithm-explained/#the-inverse-cipher) 

- [key scheduling](https://braincoke.fr/blog/2020/08/the-aes-key-schedule-explained/).

Official AES specification, link to pdf : [Federal Information Processing Standard Publication 197 - Specification for the ADVANCED ENCRYPTION STANDARD (AES)](https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf)


