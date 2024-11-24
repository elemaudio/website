# el.mm1p(props, g, x)

A first-order, "virtual analog" zero-delay multi-mode filter as defined in
Vadim Zavalishin's "The Art of VA Filter Design."

The filter can be set into lowpass, highpass, or allpass mode via the `mode`
prop, and expects two children: the first specifying the cutoff frequency in
the analog domain and the second the input signal to be filtered.

You may often pair this node with [`el.prewarp`](./prewarp.md) to transform a
digital domain cutoff frequency to analog.

Example:
```js
let out = el.mm1p({}, el.prewarp(800), el.in({channel: 0}));
```

#### Props

| Name        | Default   | Type                | Description                                                                   |
| ----------- | --------- | ------------------- | ----------------------------------------------------------------------------- |
| mode        | "lowpass" | string              | "lowpass", "highpass", or "allpass"                                           |
