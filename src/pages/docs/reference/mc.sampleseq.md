# el.mc.sampleseq(props, t)

The `mc.sampleseq` node is for scheduling sample playback over time. See [`el.sampleseq`](./sampleseq.md) for
a thorough description of how this node works.

This is nearly identical to the [`el.sampleseq`](./sampleseq.md) node, except that `el.mc.sampleseq` supports multi-channel
buffers through the virtual file system and produces multi-channel output. The return value of `el.mc.sampleseq` is an array
containing the indivdual channel signals you want to address.

```js
let [leftChannel, rightChannel] = el.mc.sampleseq({
  channels: 2,
  seq: [
    { time: 0.0, value: 1 },
    { time: 0.5, value: 0 },
    { time: 1.0, value: 1 },
    { time: 1.5, value: 0 },
  ],
  path: '/path/to/stereoVocals.wav',
  duration: 4,
}, el.div(el.time(), el.sr()));
```

#### Props

| Name        | Default  | Type                | Description                                                                   |
| ----------- | -------- | ------------------- | ----------------------------------------------------------------------------- |
| seq         | []       | Array               | The sequence of values to generate, in { time, value } pairs                  |
| path        | ""       | string              | The path to the resource in the virtual file system to play back              |
| duration    | 0        | number              | Duration of the sample buffer. Must be in the same units as the time signal   |
| channels    | None     | Number              | The number of output channels to address                                      |
