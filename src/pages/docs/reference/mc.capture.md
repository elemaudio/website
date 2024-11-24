---
sidebar_label: el.mc.capture
---

# el.mc.capture(props, g, ...xs)

Records its input signals `xs` precisely in accordance with the gate signal `g`. When the gate signal is high (== 1.0),
the capture node will record its input into an internal buffer. When the gate signal goes low (-> 0.0), recording
immediately stops, and the captured buffer is emitted via an event named "mc.capture" through the event propagation interface.

The "capture" event carries a `source` property to identify which `el.mc.capture()` node the event relates
to, as identified by the `name` prop, as well as a `data` property containing the captured data.

The output signal of the `el.mc.capture` node is just a pass-through propagation of the same input signals.

Example:
```js
// Records alternating 0.5s slices of a stereo input signal
core.render(...el.mc.capture({channels: 2, name: "test"}, el.train(1), el.in({channel: 0}), el.in({channel: 1})));

core.on('mc.capture', function(e) {
  console.log(e); // { source: "test", data: [Float32Array([...]), ...] }
});
```

#### Props

| Name     | Default   | Type   | Description                              |
| -------- | --------- | ------ | ---------------------------------------- |
| name     | undefined | String | For identifying events                   |
| channels | None      | Number | The number of output channels to address |
