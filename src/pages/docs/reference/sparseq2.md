# el.sparseq2([props], t)

Just like [`el.sparseq`](./sparseq.md), the `sparseq2` node is for sequencing
values over time. The difference is subtle: `sparseq2` takes time as an input
signal, whereas `sparseq` maintains an internal notion of time. Usage is otherwise
nearly identical.

`sparseq2` expects a sparsely defined sequence given as an array of `{ time,
value }` pairs as the `seq` prop, and a single input signal giving the current
time value. The specific units of time are at your discretion, but you should be
sure that the values given in the `seq` prop are in the same units as the input
signal.

Example:
```js
// A sequence that deals in sample time (as given by el.time() in either the
// web-renderer or offline-renderer), and increments from 1 to 4 stepping once
// per second at a 44.1kHz sample rate.
el.sparseq2({seq: [
  { time: 0, value: 1 },
  { time: 44100, value: 2 },
  { time: 44100 * 2, value: 3 },
  { time: 44100 * 3, value: 4 },
]}, el.time());
```

```js
// A sequence that deals in "beat" time (or ppqn), and increments from 1 to 4
// stepping up on each beat.
el.sparseq2({seq: [
  { time: 0, value: 1 },
  { time: 1, value: 2 },
  { time: 2, value: 3 },
  { time: 3, value: 4 },
]}, ppqn);
```

#### Props

| Name        | Default  | Type                | Description                                                                   |
| ----------- | -------- | ------------------- | ----------------------------------------------------------------------------- |
| seq         | []       | Array               | The sequence of values to generate, in { time, value } pairs                  |
| interpolate | 0        | Number              | Pass 1 for linear interpolation between successive values, 0 for none (hold)  |

