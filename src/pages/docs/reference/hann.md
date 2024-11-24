---
sidebar_label: el.hann
---

### el.hann(t)

A simple Hann window generator. The window is generated according to an incoming phasor
signal `t`, where a phase value of 0 corresponds to the left hand side of the window, and a
phase value of 1 corresponds to the right hand side of the window. Expects exactly one child,
the incoming phase.

Example:
```js
el.hann(el.phasor(1))
```
