# Playground API

The [Elementary Playground](../playground) is a live-editing environment for exploring Elementary, and the API is carefully designed
to decouple your code from the state of the running instance so that the Playground can consistently re-evaluate your code while maintaining
the desired audio output without interruptions.

In the playground, your code must adhere to the [ES6 Module format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) with
explicit `import` and `export` statements. Your code must also must provide a default export, an object with the following shape:

```js
export default {
  getVirtualFileSystem(decodeAudioData: Function): Promise<Object> {},
  render(): ElemNode | Array<ElemNode> {},
};
```

### getVirtualFileSystem

Part of being able to successfully re-evaluate your code as you type requires managing the state of the runtime for you. To
do that, the Playground initializes itself by requesting any state that you might want to persist to the running instance, such as entries
in the [Virtual File System](./guides/Virtual_File_System).

During initialization, the Playground runtime will updates its internal virtual file system with the contents of the object that you return
from this function. This function is _only_ called upon initialization, so if you make changes you will need to press the Reset button
on the Playground to rerun the initialization steps.

```js
async getVirtualFileSystem(decodeAudioData) {
  let res = await fetch('https://ia800407.us.archive.org/9/items/999WavFiles/10.mp3');
  let sampleBuffer = await decodeAudioData(res.arrayBuffer());

  return {
    'ten:0': sampleBuffer.getChannelData(0),
    'ten:1': sampleBuffer.getChannelData(1),
  };
}
```

### render

This function is the only required member of the default export object, as the playground will not be able to determine what to render
for you without it. This function is called as often as possible while you type, and it should simply return the `ElemNode` objects that
you wish to render.

If you return a single `ElemNode` object (i.e. a single channel output), the Playground will route the signal to both left and right channels,
as with a standard mono to stereo upmix. If you return an array of `ElemNode` objects, the Playground will apply your array directly to
the internal `core.render` call, thus each element in your returned array corresponds directly to the output channel array.

```js
render() {
  // Returning a mono signal
  // return el.cycle(440);

  // Returning a stereo signal
  return [el.cycle(440), el.cycle(441)];
}
```
