# el.skcompress(atkMs, relMs, threshold, ratio, kneeWidth, sidechain, xn)

A simple soft-knee compressor with parameterized attack and release times,
threshold, compression ratio and knee width.

Behaves the same as [el.compress](./compress) when `kneeWidth` is 0.

Users may drive the compressor with an optional sidechain signal, or send the
same input both as the input to be compressed and as the sidechain signal itself
for standard compressor behavior.

* `@param {Node | number} atkMs` – attack time in milliseconds
* `@param {Node | number} relMs` – release time in milliseconds
* `@param {Node | number} threshold` – decibel value above which the comp kicks in
* `@param {Node | number} ratio` – ratio by which we squash signal above the threshold
* `@param {Node | number} kneeWidth` – width of the knee in decibels, 0 for hard knee
* `@param {Node} sidechain – sidechain` signal to drive the compressor
* `@param {Node} xn` – input signal to filter

Example:

```js
// Imagine we have some drum sequences with the following names, summed into
// a single drum bus
let drumBus = el.add(kick, hat, snare, cymbals);

// We can compress the drumBus directly by passing it both as the sidechain
// signal and as the signal to filter
let out = el.skcompress(10, 100, -48, 4, 10, drumBus, drumBus);
```
