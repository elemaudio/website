# el.sampleseq([props], t)

The `sampleseq` node is similar in spirit to the [`sparseq2`](./sparseq2), but for sequencing
sample playback over time.

To see why this is helpful, let's consider that we can already sequence sample playback
using `el.sample` if we build a sequence of triggers using `sparseq2`:

```js
let seq = el.sparseq2({
  seq: [
    { time: 0.0, value: 1 },
    { time: 0.5, value: 0 },
    { time: 1.0, value: 1 },
    { time: 1.5, value: 0 },
  ]
}, el.div(el.time(), el.sr()));

let sequencedSample = el.sample({path}, seq, 1);
```

This example works great when time moves forward consistently, but breaks down if
our time signal were to jump around (i.e. in the case of running against a timeline
where the user has control to move the playhead). In our example code here, if time
suddenly jumped from `0.4s` to `0.0s`, the `sparseq2` node would not change its output
because at both of these points in time it should emit `1`. But `el.sample` does not know
to retrigger if it has not received a `0` (it only triggers on the rising edge of an incoming
pulse signal).

Here is exactly where `sampleseq` plays a role. Using `sampleseq` we can effectively merge
the above example into one node, so that if our input time does jump around, we can effectively
reposition the playhead within the sample buffer that we're playing.

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
}, el.div(el.time(), el.sr()));

let sequencedSample = el.sample({path}, seq, 1);
```

So `sampleseq` expects a sparsely defined sequence given as an array of `{ time,
value }` pairs as the `seq` prop, and a single input signal giving the current
time value. The specific units of time are at your discretion, but you should be
sure that the values given in the `seq` prop are in the same units as the input
signal. Similar to the idea of `el.sample`, a value of `1` in the sequence of values
represents triggering the sample, and a value of `0` represents muting the sample.

`sampleseq` also expects a `path` prop equivalent to that of `el.sample`, as well
as a `duration` prop which represents the sample's duration _in the same units as
the input time signal_.

#### Props

| Name        | Default  | Type                | Description                                                                   |
| ----------- | -------- | ------------------- | ----------------------------------------------------------------------------- |
| seq         | []       | Array               | The sequence of values to generate, in { time, value } pairs                  |
| path        | ""       | string              | The path to the resource in the virtual file system to play back              |
| duration    | 0        | number              | Duration of the sample buffer. Must be in the same units as the time signal   |
