# el.sampleseq(props, t)

The `sampleseq2` is equivalent to [`el.sampleseq`](./sampleseq), except that it adds the
ability for pitch shifting and time stretching the source sample.

```js
let seq = el.sampleseq({
  seq: [
    { time: 0.0, value: 1 },
    { time: 0.5, value: 0 },
    { time: 1.0, value: 1 },
    { time: 1.5, value: 0 },
  ],
  path,
  duration: 4,
  shift: 7,
  stretch: 2,
}, el.div(el.time(), el.sr()));

let sequencedSample = el.sample({path}, seq, 1);
```

Like `sampleseq`, `sampleseq2` expects a sparsely defined sequence given as an array of `{ time,
value }` pairs as the `seq` prop, and a single input signal giving the current
time value. The specific units of time are at your discretion, but you should be
sure that the values given in the `seq` prop are in the same units as the input
signal. Similar to the idea of `el.sample`, a value of `1` in the sequence of values
represents triggering the sample, and a value of `0` represents muting the sample.

`sampleseq2` also expects a `path` prop equivalent to that of `el.sample`, as well
as a `duration` prop which represents the sample's duration _in the same units as
the input time signal_.

Finally, `sampleseq2` supports a `pitch` prop and a `stretch` prop, for shifting or stretching the source
material respectively. Note that when applying a time stretch, the `duration` property should reflect the duration
of the source sample _before_ time stretching is applied.

#### Props

| Name        | Default  | Type                | Description                                                                   |
| ----------- | -------- | ------------------- | ----------------------------------------------------------------------------- |
| seq         | []       | Array               | The sequence of values to generate, in { time, value } pairs                  |
| path        | ""       | string              | The path to the resource in the virtual file system to play back              |
| duration    | 0        | number              | Duration of the sample buffer. Must be in the same units as the time signal   |
| shift       | 0        | number              | Pitch shift amount in semitones                                               |
| stretch     | 1        | number              | Time stretch amount, in the range [0.25, 4]                                   |
