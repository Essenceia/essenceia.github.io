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

#### Example

$\dfrac{11}{2} (5,5)$ with $e = 15$ and $f = 16$ would written as : 
```
0 000000000000101 1000000000000000
S        E                F
```
 
### Floating point 


For the IEEE 754 standard 32 bit float : 

- *sign* $S$ 1 bit, positive `0`, negative `1`
- *exponent* $E$ 8 bits,
- *mantissa* $M$ 23 bits, also reffered to as the significant

$$
(-1)^{S} \times 1.M \times 2^{E-127}
$$

Analogy: [https://fabiensanglard.net/floating_point_visually_explained/](https://fabiensanglard.net/floating_point_visually_explained/)
- *exponent* == window
- *mantissa* == offset 

## Ressources 

[IEEE 754 visualizer](https://bartaz.github.io/ieee754-visualization/)
