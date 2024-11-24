# Math

Basic utilities for performing mathematical operations over various input signals.

### el.in

Identity function, `f(x) = x`.

Can also be used for accepting an input signal from the audio driver, whereupon
the `channel` prop will be used to decide which incoming signal channel will be passed forward.

This same feature can also be used for selecting one of N children, for example:

```js
el.in({channel: 2}, w, x, y, z); // Equivalent to `y`
```

#### Props

| Name     | Default  | Type   | Description                            |
| -------- | -------- | -------|--------------------------------------- |
| channel  | 0        | Number | Selects which input channel to forward |

### el.sin

Computes the sin of the input signal. Expects exactly 1 child node.

### el.cos

Computes the cos of the input signal. Expects exactly 1 child node.

### el.tan

Computes the tan of the input signal. Expects exactly 1 child node.

### el.tanh

Computes the hyperbolic tan of the input signal. Expects exactly 1 child node.

### el.asinh

Computes the inverse hyperbolic sin of the input signal. Expects exactly 1 child node.

### el.ln

Computes the natural logarithm (log base `e`) of the input signal. Expects exactly 1 child node.

### el.log

Computes the log (base 10) of the input signal. Expects exactly 1 child node.

### el.log2

Computes the log (base 2) of the input signal. Expects exactly 1 child node.

### el.ceil

Computes the ceiling (rounding up to the nearest whole number) of the input signal. Expects exactly 1 child node.

### el.floor

Computes the floor (rounding down to the nearest whole number) of the input signal. Expects exactly 1 child node.

### el.round

Rounds the input signal to the nearest whole number. Expects exactly 1 child node.

### el.sqrt

Computes the square root of the input signal. Expects exactly 1 child node.

### el.exp

Computes `e^x` where x is the input signal, and `e` Euler's number. Expects exactly 1 child node.

### el.abs

Computes the absolute value of the input signal. Expects exactly 1 child node.

### el.eq

Compares the first input to the second input, returning 1 when the two signals
have equal values, and 0 otherwise.

### el.and

Compares the first input to the second input with a binary "and" operation. Returns 1 when the two signals
both have a value of 1, and 0 otherwise.

### el.or

Compares the first input to the second input with a binary "or" operation. Returns 1 when either of the two signals
has a value of 1, and 0 otherwise.

### el.le

Compares the first input to the second input, returning 1 when the first is less
than the second, and 0 otherwise. Expects exactly 2 children.

### el.leq

Compares the first input to the second input, returning 1 when the first is less
than or equal to the second, and 0 otherwise. Expects exactly 2 children.

### el.ge

Compares the first input to the second input, returning 1 when the first is greater
than the second, and 0 otherwise. Expects exactly 2 children.

### el.geq

Compares the first input to the second input, returning 1 when the first is greater
than or equal to the second, and 0 otherwise. Expects exactly 2 children.

### el.pow

Computes `a^b` where `a` is the first input signal and `b` is the second. Expects exactly 2 children.

### el.mod

Computes `a % b` where `a` is the first input signal and `b` is the second. Expects exactly 2 children.

### el.min

Computes `min(a, b)` where `a` is the first input signal and `b` is the second. Expects exactly 2 children.

### el.max

Computes `max(a, b)` where `a` is the first input signal and `b` is the second. Expects exactly 2 children.

### el.add

Performs a left fold over the available inputs with the add operation: `(((in1 + in2) + in3) + ...)`.
Expects one or more children.

### el.sub

Performs a left fold over the available inputs with the subtract operation: `(((in1 - in2) - in3) - ...)`.
Expects one or more children.

### el.mul

Performs a left fold over the available inputs with the multiply operation: `(((in1 * in2) * in3) * ...)`.
Expects one or more children.

### el.div

Performs a left fold over the available inputs with the divide operation: `(((in1 / in2) / in3) / ...)`.
Expects one or more children.

