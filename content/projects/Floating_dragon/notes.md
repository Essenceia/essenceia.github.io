Fighthing my dragons: floating point scares me. 

## Def

(*ensemble des entiers naturels* $\mathbb{N}$*, tel que* $0$ *est le plus petit entire naturel*)

**real numbers**: $\mathbb{Z}$ (*ensemble des entiers relatifs*), integers, infinit but countable (*numberable*) 

(*ensemble des nombre decimaux relatif,* $\mathbb{D}$ *, est un nombre relle qui peut s'ecrire avec une ecriture decimale
limitee, c'est a dire avec une partie entiere et une partie decimale ayant un nombre fini de chiffres apres la virgule.*)

**rational numbers**: $\mathbb{Q}$ (`q` for quotient) , ratio of two real numbers, every rational numbe has a unique representation in lowest term (*fraction irreductible*),achieved
by canceling any common factor in the numerator and denominator.

(*ensemble des reels* $\mathbb{R}$ *incluse les irratonelles, indenombrable*) 


## Representations

$\mathbb{Q}$ can be represented by a ratio of integers $\mathbb{Z}$: a numerator and a denominator, let $x \in \mathbb{Q}$: 

$$
x = \dfrac{a}{b} 
$$

with $a, b \in \mathbb{Z}$ and $b \not= 0$.

### Fixed point 

Fixed = fixed number of numbers after the decimal point. 
eg: US securities have a per security fixed tick size


Data stored is divided into 3 fields : 

- **sign** $S$ 1 bit, positive `0`, negative `1`
- $E$  (*partie entiere*) 
- $F$ (*partie fractionaire*) each deminal binary corresponds to an inverse of the power of 2. The first term (LMB, reading left to right) is $\dfrac{1}{2}$
, second $\dfrac{1}{4}$, $n^{th}$ is $\dfrac{1}{2^{n}}$. 

A fixed point number is: 

$$
(-1)^{S} \times (\sum_{i=0}^{e-1} 2^{i} +\sum_{j=1}^{f} \dfrac{1}{2^{f-j+1}})
$$

Let $e$ be the number of bits in the *partie entiere* and $f$ in the *partie fractionaire*, the range of a fixed point number with is within range:

$$
[2^{e-1} - \dfrac{1}{2^{f}}:-2^{e-1}]
$$

Fixed points numbers are intrensincly limited in the range and precision of numbers they can store. 

**Eg**

$\dfrac{11}{2} (5,5)$ with $e = 15$ and $f = 16$ would written as : 
```
0 000000000000101 1000000000000000
S        E                F
```
 
### Floating point 

The floating point representation is based on the exponential (scientific) notation: 

$$
x = \pm S \times 10^{E}
$$

where numbers are normalized such that $1 \leq S < 10$, $S \in \mathbb{D}$ and $E \in \mathbb{Z}$. 

Analogy: [https://fabiensanglard.net/floating_point_visually_explained/](https://fabiensanglard.net/floating_point_visually_explained/)
- *exponent* == window
- *mantissa* == offset 

**Eg** 

$0.00036525$ is written as $3.6525\times10^{-4}$ using the scientific notation.

We can imagine that the **decimal point floats to the position** immediately after the first nonzero digit 
in the decimal expansion of the number: hence the name floating point.

#### Base 2

In base 2: 

$$
x = \pm S \times 2^{E}
$$

let $1 \leq S < 2$ ($S \in \mathbb{D}$ and $E \in \mathbb{Z}$).

Consequently the binary expansion of $S$ is : 
$$
S =  (b_{0} , b_{1} b_{2} b_{3} ...)_{2} with b_{0} = 1
$$

Given $b_{0} = 1$ we can omit it from being stored and save on 1 bit, this is the hidden bit. 

**Eg** 

Using the same example as for fixed point:
$$
\dfrac{11}{2} = (1 , 011)_{2} \times 2^{2}
$$

#### Precision 

The precision, denoted as $p$ in the floating point system, is the number of bits in the significant $S$, including the hidden bit. 

Any normalized floating point number with precision $p$ can be written as: 
$$
x = \pm (1, b_{1} b_{2} ... b_{p-1})_{2} \times 2^{E}
$$

Note: the smallest $x$ that is greater than $1$ is: 

$$
(1,000...1)_{2} = 1 + 2^{-(p-1)}
$$

we call this smallest step the machine epsilon, notation $\epsilon$ : the gap between this smallest number and 1

$$
\epsilon = (0,000...1)_{2} = 2^{-(p-1)}
$$

Let us now define $ulp(x)$, as the gap between $x$ and the next larger/smaller floating point number ($x > 0$/$x < 0$). 

$$
ulp(x) = (0,000...1)_{2} \times 2^{E} = \epsilon \times 2^{E}
$$

Note: $ulp(x)$ grows exponentially with $E$, aka: the furter we go from 0, the larger the gap. 

![ulp, source: https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html](ulp.gif)


### IEEE 754

> "MATLAB's creator Dr. Cleve Moler used to advise foreign visitors not to miss the country's two most awesome spectacles: the Grand Canyon, and meetings of IEEE p754."

#### Special numbers 

Since the leading bit of the normalized number $b_{0}$ is hidden, we 
need a special representation for $0$.
And while on the subject of special number representation, we also have a 
sepcial representation for $\infinity$. 

Special numbers on IEEE 754, each of these has a different representation: 
- $0$, $sign = 0, exponent = 0, significant = 0$
- $-0$ (same number as $0$) $sign = 1, exponent = 0, significant = 0$
- $\infinty$, result of a divide by $0$ $sign = 0, exponent = max, significant = 0$
- $-\infinty$ $sign = 1, exponent = max, significant = 0$
- $NaN$, not a number but an error pattern $sign = ignored, exponent = max, significant =\not 0$


#### Single floating point format: `float32_t`

For the IEEE 754 standard 32 bit float : 

- *sign* $S$ 1 bit, positive `0`, negative `1`
- *exponent* $E$ 8 bits, 
- *mantissa* $M$ 23 bits, also reffered to as the fractional part or significant

##### Exponent 

The exponenet field doesn't use a 2's complement representation, but a "biased representation.
The bitstream stores the binary representation of $E+127$. $127$ is added to the desired exponent $E$ 
and is called the "exponent bias". 

Eg: $1 = (1,000...0)_}{2}\times2^{0}= sign=0, exponent=0111..111=max-1, signficant=0$ 

Given the special numbers, the range of the normalized numbers (not special, $\mathbb{D}* \leftrightaeeay \mathbb{D} \setminus 0$ )
is between $(1)_{2}$ and $(0111...1)_{2}$ or 1 and 254, representing the exponents from 
$[E_{min} = -126: E_{max} = 127]$.

Thus the smallest and largest floating point number we can store with f32 is : 
$$
N_{min} = (1,000...0)_{2}\times2^{-126}=2^{-126)\approx (1,2\times10^{-38})_{10}
$$
$$
N_{max} = (1,111...10)_{2}\times2^{127}=(2-2^{23})\times2^{127)\approx (3,4\times10^{38})_{10}
$$



## Ressources 

[IEEE 754 visualizer](https://bartaz.github.io/ieee754-visualization/)
