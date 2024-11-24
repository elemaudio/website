---
sidebar_label: el.mc.table
---

# el.mc.table(props, t)

Loads a lookup table from a buffer in the [virtual file system](../guides/Virtual_File_System.md), from which it
performs an interpolated read with a position determined by the incoming signal phase.

The lookup position is given as a normalized phase value with linear interpolation for
lookup positions that fall between two distinct values. For example, driving
a lookup table with a simple phasor will sweep through the entire lookup table at
the rate of the phasor (this example is great for wavetable synthesis). To read
only a partial segment of the wavetable, you can multiply and add to the phasor such
that the table sweeps through just the desired segment.

This node is nearly identical to the [`el.table`](./table.md) node, except that `el.mc.table` supports multi-channel
buffers through the virtual file system and produces multi-channel output. The return value of `el.mc.table` is an array
containing the indivdual channel signals you want to address.

Example:
```js
let [leftChannel, rightChannel] = el.table({channels: 2, path: '/path/to/stereoWaveTable.wav'}, el.phasor(220));
```

#### Props

| Name     | Default  | Type                   | Description                                   |
| -------- | -------- | ---------------------- | --------------------------------------------- |
| path     | ''       | String                 | The name of the sample buffer in the VFS      |
| channels | None     | Number                 | The number of output channels to address      |

