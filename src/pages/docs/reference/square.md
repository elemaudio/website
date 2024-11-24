---
sidebar_label: el.square
---

# el.square(rate)

Outputs a naive square oscillator at the given frequency. Expects exactly one child
specifying the oscillator frequency in `hz`.

Typically, due to the aliasing of the naive square at audio rates, this oscillator
is only used for low frequency modulation and control signals.
