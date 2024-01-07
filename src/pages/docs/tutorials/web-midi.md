# Web MIDI

This tutorial explains the basics of controlling an Elementary Audio app with
MIDI. We will use the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) in this tutorial, but the approach to controlling Elementary through MIDI could be adapted to MIDI in a plugin or another MIDI source.

The code discussed in this tutorial is available in the MIT-licensed [elementary-webmidi-demo](https://github.com/bgins/elementary-webmidi-demo) repository.

## Playing notes

We will create a simple web app that plays notes sent by a MIDI controller. The app will:

- Detect when a MIDI device is connected and disconnected
- Provide an interface for selecting a MIDI device
- Display the last played MIDI note and its associated frequency

The app uses vanilla JavaScript and no framework to make it broadly accessible. Keep in mind this is a toy application intended to convey ideas. Your app will likely use a framework, stronger types, defensive programming, and other niceties.

At a high level, the app has three parts:

- A Web MIDI module for interfacing with devices
- Audio engine and synth modules for generating audio graphs and rendering them
- An event emitter that sends note events from Web MIDI to the audio implementation

The [web-renderer](https://www.elementary.audio/docs/packages/web-renderer) ultimately renders audio using the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) because we are working in the browser.

## Control

Our app uses [WEBMIDI.js](https://webmidijs.org/) to access the Web MIDI API. This library abstracts away many low-level Web MIDI details and makes detecting devices and capturing note events easy.

Our [midi module](https://github.com/bgins/elementary-webmidi-demo/blob/main/src/midi.js) includes a `noteEmitter` to send note events and `selectedInput` to track the active MIDI controller. We set the `selectedInput` to `null` until a device is selected.

```js
import { WebMidi } from "webmidi";

export class Midi {
  noteEmitter;
  selectedInput;

  constructor(noteEmitter) {
    this.noteEmitter = noteEmitter;
    this.selectedInput = null;
  }

  // Class methods...
}
```

Accessing MIDI devices requires an async call and must be made in a secure context (`localhost` or a site with properly configured `https`). In addition, some browsers will prompt users for permission when a site first requests Web MIDI access.

Our `Midi` class has an `initialize` method that enables Web MIDI and sets up event handlers to update available MIDI devices.

```js
async initialize(displayControllers) {
  try {
    await WebMidi.enable();
    displayControllers(this.#getInputNames(), this.selectedInput?.name);

    WebMidi.addListener("connected", () => {
      displayControllers(this.#getInputNames(), this.selectedInput?.name);
    });

    WebMidi.addListener("disconnected", () => {
      displayControllers(this.#getInputNames(), this.selectedInput?.name);
    });
  } catch (err) {
    console.error("WebMidi could not be initialized:", err);
  }
}
```

`#getInputNames` is a private helper function to get MIDI device names.

```js
#getInputNames() {
  return WebMidi.inputs.map((input) => input.name);
}
```

We won't cover the details of `displayControllers` or any UI functions in this tutorial. Check the comments in the code for more information.

Lastly, the `Midi` class has a `setController` method to set the active controller and connect it to the `noteEmitter`.

```js
setController(controller) {
  // Stop any active notes
  this.noteEmitter.emit("stopAll");

  // Remove listeners from the previous input
  if (this.selectedInput) {
    this.selectedInput.removeListener("noteon");
    this.selectedInput.removeListener("noteoff");
  }

  // Set the new input
  this.selectedInput = WebMidi.getInputByName(controller);

  // Add note on listener
  this.selectedInput.addListener("noteon", (event) => {
    const midiNote = event.note.number;
    this.noteEmitter.emit("play", { midiNote });
  });

  // Add note off listener
  this.selectedInput.addListener("noteoff", (event) => {
    const midiNote = event.note.number;
    this.noteEmitter.emit("stop", { midiNote });
  });
}
```

The `noteEmitter` sends note events that our audio implementation will receive. The events include:

- `play`. Play a note.
- `stop`. Stop a note.
- `stopAll`. Stop all notes.

When a new controller is selected, we stop all notes and remove event listeners from the previously selected input. Then, we look up the new controller by name and set it as the selected input. Lastly, we add `noteon` and `noteoff` event listeners to the selected input that will emit `play` and `stop` note events.

## Audio

The audio implementation includes an audio engine and a synth. The audio engine initializes an Elementary web renderer and connects it to a Web Audio context. The synth creates audio graphs representing our notes and passes them to the audio engine for rendering.

### Engine

The [engine module](https://github.com/bgins/elementary-webmidi-demo/blob/main/src/audio/engine.js) includes a `core` web renderer and a Web audio `context`.

```js
import WebRenderer from "@elemaudio/web-renderer";

export class Engine {
  context;
  core;

  constructor() {
    this.core = new WebRenderer();
    this.context = new AudioContext();
    this.context.suspend();
  }

  // Class methods...
}
```

Web Audio requires a user interaction before we can produce any sound, so we initially suspend the audio context.

The `Engine` class has an `initialize` method that we will call on user interaction.

```js
async initialize() {
  // Start the audio context
  this.context.resume();

  // Initialize web renderer
  const node = await this.core.initialize(this.context, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });

  // Connect web renderer to audio context
  node.connect(this.context.destination);
}
```

`initialize` resumes the audio context, initializes the `WebRenderer`, and connects it to the Web Audio context destination. The destination is conceptually your speakers, but it can be any device your browser connects to.

We configure the WebRenderer with zero inputs, one output, and one output channel. Our app needs no inputs and outputs a mono signal.

The `Engine` class also has a `render` method that renders an audio graph with an `ElemNode` type.

```js
render(node) {
  if (this.context.state === "running") {
    this.core.render(node);
  }
}
```

We check if the audio context is running and render the audio graph if so.

### Synth

The [synth module](https://github.com/bgins/elementary-webmidi-demo/blob/main/src/audio/synth.js) contains a few helper functions to create and sum polyphonic synth voices and generate silence.

The `synthVoice` function creates an `ElemNode` with a single voice.

```js
function synthVoice(voice) {
  return el.mul(
    el.const({ key: `${voice.key}:gate`, value: voice.gate }),
    el.blepsaw(el.const({ key: `${voice.key}:freq`, value: voice.freq })),
  );
}
```

The voice is an `el.blepsaw` with a gate to control whether the voice is on or off. We [key](https://www.elementary.audio/docs/guides/Understanding_Keys) both parts to help Elementary Audio optimize rendering.

The `synth` function sums multiple synth voices into a single audio graph and decreases the overall amplitude to a reasonable level.

```js
function synth(voices) {
  return el.mul(el.add(...voices.map((voice) => synthVoice(voice))), 0.1);
}
```

The `silence` function generates silence when no notes are held on the selected controller.

```js
function silence() {
  return el.const({ key: "silence", value: 0 });
}
```

The `Synth` class uses these functions to generate audio graphs with up to eight voices. The next section will connect it to our note emitter to play and stop notes.

Our `Synth` class includes an array of `voices` representing held notes on the selected MIDI controller.

```js
import { el } from "@elemaudio/core";

export class Synth {
  voices = [];

  // Class methods...
}
```

When a `play` note event is received, the `playNote` method generates a key, computes the frequency for the note, and updates the voices.

```js
playNote(midiNote) {
  const key = `v${midiNote}`;
  const freq = computeFrequency(midiNote);

  // Add note to voices after removing previous instances.
  this.voices = this.voices
    .filter((voice) => voice.key !== key)
    .concat({ gate: 1, freq, key })
    .slice(-8);

  return synth(this.voices);
}
```

Any previous instances of the note are filtered out, the new voice is added with an "on" gate, and we drop any notes exceeding eight-note polyphony.

The `computeFrequency` function computes frequency in 12-tone equal temperament tuned to 440Hz with a base MIDI note of `69`.

```js
export function computeFrequency(midiNote) {
  return 440 * 2 ** ((midiNote - 69) / 12);
}
```

The `stopNote` method drops the voice associated with a note when receiving a `stop` note event.

```js
stopNote(midiNote) {
  const key = `v${midiNote}`;
  this.voices = this.voices.filter((voice) => voice.key !== key);

  if (this.voices.length > 0) {
    return synth(this.voices);
  } else {
    return silence();
  }
}
```

We return `silence` if the voice was the last active voice.

Lastly, the `stopAllNotes` method removes all voices and returns silence.

```js
stopAllNotes() {
  this.voices = [];

  return silence();
}
```

## Wiring it all up

We now have all the pieces we need. The `Midi` implementation sends note events that the `Synth` uses to generate audio graphs, and the `Engine` renders them..

The [main module](https://github.com/bgins/elementary-webmidi-demo/blob/main/src/main.js) imports and instantiates our implementations.

```js
import Emittery from "emittery";

import "./style.css";
import * as ui from "./ui";
import { Engine } from "./audio/engine";
import { Midi } from "./midi";
import { Synth, computeFrequency } from "./audio/synth";

const noteEmitter = new Emittery();
const engine = new Engine();
const midi = new Midi(noteEmitter);
const synth = new Synth();
```

We pass the `noteEmitter` to the `Midi` implementation.

Next, we set up note event listeners.

```js
// Play note and update indicators
noteEmitter.on("play", ({ midiNote }) => {
  engine.render(synth.playNote(midiNote));
  ui.setMIDINote(midiNote);
  ui.setFrequency(computeFrequency(midiNote));
});

// Stop note
noteEmitter.on("stop", ({ midiNote }) => {
  engine.render(synth.stopNote(midiNote));
});

// Stop all notes
noteEmitter.on("stopAll", () => {
  engine.render(synth.stopAllNotes());
});
```

On `play`, `stop`, and `stopAll` events, the synth generates an audio graph, and the engine renders it.

We mentioned earlier that we must initialize our `Midi` and `Engine` implementations on user interaction. The `getStarted` function does both when a user clicks a "Get Started" button.

```js
async function getStarted() {
  await midi.initialize(displayControllers);
  await engine.initialize();
  ui.getStarted();
}
```

One final detail and our app is complete. When a user selects a controller in the UI, we call the `Midi.setController` method.

```js
function setController(controller) {
  midi.setController(controller);
  ui.selectController(controller);
}
```

And that's it! We have a simple app that uses Web MIDI to control Elementary Audio.

We have a few suggested exercises if you want to explore controllers in the browser further.

- Add a gain control to the synth and update it with MIDI CC
- Update the app to render stereo, add a pan control, and update it with MIDI CC
- Add a `keyboard` controller that takes computer keyboard events to play notes
