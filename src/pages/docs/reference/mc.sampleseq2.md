# el.mc.sampleseq2(props, t)

The `mc.sampleseq2` is equivalent to [`el.mc.sampleseq`](./mc.sampleseq), except that it adds the
ability for pitch shifting and time stretching the source sample during playback. See [`el.sampleseq`](./sampleseq)
and the corresponding [`el.sampleseq2`](./sampleseq2) for a thorough description of the utility here.

This node is nearly identical to the [`el.sampleseq2`](./sampleseq2.md) node, except that `el.mc.sampleseq2` supports multi-channel
buffers through the virtual file system and produces multi-channel output. The return value of `el.mc.sampleseq2` is an array
containing the indivdual channel signals you want to address.

```js
let [leftChannel, rightChannel] = el.mc.sampleseq2({
  channels: 2,
  seq: [
    { time: 0.0, value: 1 },
    { time: 0.5, value: 0 },
    { time: 1.0, value: 1 },
    { time: 1.5, value: 0 },
  ],
  path: '/path/to/stereoVocals.wav',
  duration: 4,
  shift: 7,
  stretch: 2,
}, el.div(el.time(), el.sr()));
```

#### Props

| Name        | Default  | Type                | Description                                                                   |
| ----------- | -------- | ------------------- | ----------------------------------------------------------------------------- |
| seq         | []       | Array               | The sequence of values to generate, in { time, value } pairs                  |
| path        | ""       | string              | The path to the resource in the virtual file system to play back              |
| duration    | 0        | number              | Duration of the sample buffer. Must be in the same units as the time signal   |
| shift       | 0        | number              | Pitch shift amount in semitones                                               |
| stretch     | 1        | number              | Time stretch amount, in the range [0.25, 4]                                   |
| channels    | None     | Number              | The number of output channels to address                                      |
