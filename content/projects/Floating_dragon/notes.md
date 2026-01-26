Fighthing my dragons: floating point scares me. 

## Parts 

For the IEEE 754 standard 32 bit float : 

- *significant* $S$ 1 bit, sign, positive `0`, negative `1`
- *exponent* $E$ 8 bits,
- *mantissa* $M$ 23 bits,

$$
(-1)^{S}*1.M*2^{E-127}
$$

Analogy: [https://fabiensanglard.net/floating_point_visually_explained/](https://fabiensanglard.net/floating_point_visually_explained/)
- *exponent* == window
- *mantissa* == offset 

## Ressources 

[IEEE 754 visualizer](https://bartaz.github.io/ieee754-visualization/)
