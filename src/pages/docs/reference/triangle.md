---
sidebar_label: el.triangle
---

# el.triangle(rate)

Outputs a naive triangle oscillator at the given frequency. Expects exactly one child
specifying the oscillator frequency in `hz`.

Typically, due to the aliasing of the naive triangle at audio rates, this oscillator
is used for low frequency modulation and control signals.
