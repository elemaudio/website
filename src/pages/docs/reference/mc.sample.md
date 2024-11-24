---
sidebar_label: el.mc.sample
---

# el.mc.sample(props, t)

Loads a sample from the [virtual file system](../guides/Virtual_File_System.md) and triggers its playback on the rising edge of an incoming
pulse train. Expects a props arg and then one child, `t`, the pulse train to trigger playback.

This node is nearly identical to the [`el.sample`](./sample.md) node, except that `el.mc.sample` supports multi-channel
buffers through the virtual file system and produces multi-channel output. The return value of `el.mc.sample` is an array
containing the indivdual channel signals you want to address.

```js
let [leftChanne, rightChannel] = el.mc.sample({channels: 2, path: 'stereoVocals.wav'}, el.train(1));
```

#### Props

| Name         | Default   | Type                  | Description                                                               |
| ------------ | --------- | --------------------- | ------------------------------------------------------------------------- |
| path         | ''        | String                | The name of the sample buffer in the VFS                                  |
| mode         | 'trigger' | String                | One of "trigger", "gate", "loop"                                          |
| startOffset  | 0         | Number                | Offset in samples from the start of the sample where playback starts      |
| stopOffset   | 0         | Number                | Offset in samples from the end of the sample where playback ends          |
| playbackRate | 1         | Number                | Set below 1.0 to slow (and pitch) down, above 1.0 to speed (and pitch) up |
| channels     | None      | Number                | The number of output channels to address                                  |
