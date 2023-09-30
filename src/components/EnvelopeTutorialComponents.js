import React, { useState, useEffect, useRef, useContext } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { el } from '@elemaudio/core';

import ResizingCanvas from './ResizingCanvas';
import { RenderContext } from '@/lib/RenderContext';


export function Example(props) {
  return (
    <div className="relative w-full bg-slate-800 rounded-md">
      {props.children}
    </div>
  );
}

export function getDefaultVoiceState(numVoices) {
  return {
    nextVoice: 0,
    voices: [
      {gate: 0.0, note: 60, freq: 440, tc: 0.5, key: 'v1'},
      {gate: 0.0, note: 60, freq: 440, tc: 0.5, key: 'v2'},
      {gate: 0.0, note: 60, freq: 440, tc: 0.5, key: 'v3'},
      {gate: 0.0, note: 60, freq: 440, tc: 0.5, key: 'v4'},
    ].slice(0, numVoices),
  };
}

export function keyToNote(key) {
  switch (key) {
    case 'a': return 60;
    case 's': return 62;
    case 'd': return 64;
    case 'f': return 65;
    case 'g': return 67;
    case 'h': return 69;
    case 'j': return 71;
    case 'k': return 72;
    case 'l': return 74;
    case ';': return 76;
    default:
      return 0;
  }
}

export function allocateVoice(e, voiceState) {
  let note = keyToNote(e.key);
  let noteToFreq = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // Only certain letter keys
  if (note === 0)
    return voiceState;

  let newState = Object.assign({}, voiceState, {
    voices: voiceState.voices.map(function(v, i) {
      if (i === voiceState.nextVoice) {
        return { gate: 1.0, note, freq: noteToFreq(note), tc: 0.01 + Math.random() * Math.random(), key: v.key };
      }

      return Object.assign({}, v);
    }),
  });

  if (++newState.nextVoice >= newState.voices.length)
    newState.nextVoice -= newState.voices.length;

  return newState;
}

export function deallocateVoice(e, voiceState) {
  let note = keyToNote(e.key);

  // Only certain letter keys
  if (note === 0)
    return voiceState;

  return Object.assign({}, voiceState, {
    voices: voiceState.voices.map(function(v, i) {
      if (v.note === note) {
        return Object.assign({}, v, {gate: 0});
      }

      return Object.assign({}, v);
    }),
  });
}

export function deallocateAllVoices(voiceState) {
  return Object.assign({}, voiceState, {
    voices: voiceState.voices.map(function(v, i) {
      return Object.assign({}, v, {gate: 0});
    }),
  });
}

export function plotLineThroughPoints(ctx, width, height, points, numSteps, color) {
  ctx.beginPath();
  ctx.moveTo(0, height * 0.5 - (points[0] * height * 0.45));

  for (let i = 1; i < numSteps; ++i) {
    ctx.lineTo(i * (width / points.length), height * 0.5 - (points[i] * height * 0.45));
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function ResumeAudioContextLink(props) {
  let renderContext = useContext(RenderContext);
  let resume = async () => {
    if (renderContext.audioContext && renderContext.audioContext.state === 'suspended') {
      await renderContext.audioContext.resume();
    }
  }

  return (
    <button className="text-pink-400 hover:text-pink-500" onClick={resume}>
      {props.children}
    </button>
  );
}

export function AttackReleaseExample(props) {
  let renderContext = useContext(RenderContext);
  let vizRef = useRef({
    gate: {
      data: new Float32Array(1024),
      next: 0,
    },
    env: {
      data: new Float32Array(1024),
      next: 0,
    },
  });

  // Instead of setting visible, ask the SpotlightContext to setSpotlight("arExample")
  // Then here I can check spotlightContext.spotlight === "arExample" to identify if this
  // component is the one that should respond to key events. Otherwise I'll get two examples
  // trying to play noise at the same time if they're both visible at the same time.
  let [visible, setVisible] = useState(false);
  let [voiceState, setVoiceState] = useState(getDefaultVoiceState(1));

  let onDraw = (ctx, width, height, frameCount) => {
    ctx.clearRect(0, 0, width, height);
    let numPoints = (vizRef.current.gate.next - 1) % 1024;
    plotLineThroughPoints(ctx, width, height, vizRef.current.gate.data, numPoints, '#94A3B8');
    plotLineThroughPoints(ctx, width, height, vizRef.current.env.data, numPoints, '#F472B6');
  };

  useEffect(() => {
    if (visible) {
      let renderKeyDown = (e) => {
        if (!e.repeat) {
          setVoiceState(allocateVoice(e, voiceState));
        }
      }

      let renderKeyUp = (e) => setVoiceState(deallocateVoice(e, voiceState));
      let silence = (e) => setVoiceState(deallocateAllVoices(voiceState));

      document.addEventListener('keydown', renderKeyDown);
      document.addEventListener('keyup', renderKeyUp);
      document.addEventListener('visibilitychange', silence);

      return () => {
        document.removeEventListener('keydown', renderKeyDown);
        document.removeEventListener('keyup', renderKeyUp);
        document.removeEventListener('visibilitychange', silence);
      };
    }
  }, [visible, voiceState]);

  useEffect(() => {
    (async () => {
      let core = renderContext.renderer;

      if (renderContext.audioContext && renderContext.audioContext.state === 'suspended') {
        await renderContext.audioContext.resume();
      }

      if (core) {
        let monoOut = el.add(...voiceState.voices.map(function(v, i) {
          let gate = el.const({key: `${v.key}:gate`, value: v.gate});
          let env = el.smooth(el.tau2pole(0.2), el.meter({name: 'gate'}, gate));
          let mapTo = (x, min, max) => el.add(min, el.mul(x, max - min));

          return el.lowpass(
            el.add(
              mapTo(el.meter({name: 'env'}, env), 100, 1800),
              mapTo(el.mul(0.5, el.add(1, el.cycle(0.5))), 100, 1800),
            ),
            0.717,
            el.mul(0.2, env, el.add(
              el.blepsaw(el.smooth(el.tau2pole(0.01), el.const({key: `${v.key}:freq:1`, value: v.freq}))),
              el.blepsaw(el.smooth(el.tau2pole(0.01), el.const({key: `${v.key}:freq:2`, value: v.freq * 1.01}))),
            ))
          );
        }));

        // let [yl, yr] = srvb({
        //   key: 'vrb',
        //   size: 0.5,
        //   decay: 0.7,
        //   mod: 0.2,
        //   mix: 0.3,
        // }, monoOut, monoOut)
        let [yl, yr] = [monoOut, monoOut];

        console.log(core.render(yl, yr));
      }
    })();
  }, [voiceState]);

  useEffect(() => {
    let core = renderContext.renderer;
    let onMeter = (e) => {
      if (e.source === 'gate') {
        vizRef.current.gate.data[vizRef.current.gate.next++ % 1024] = e.max;
      }

      if (e.source === 'env') {
        vizRef.current.env.data[vizRef.current.env.next++ % 1024] = e.max;
      }
    };

    if (core && visible) {
      core.on('meter', onMeter);

      return () => {
        core.off('meter', onMeter);
      }
    }
  }, [visible, renderContext.renderer])

  return (
    <div>
      <VisibilitySensor onChange={(v) => setVisible(v)}>
        <figure>
          <Example>
            <ResizingCanvas className="w-full" onDraw={onDraw} />
          </Example>
          <figcaption className="text-center">
            Example 1: Exponential Attack/Release (AR) envelopes responding to keypress events. The white line
            represents the onset/offset signal, the pink represents the envelope derived by filtering.
          </figcaption>
        </figure>
      </VisibilitySensor>
      <figure>
        {props.children}
        <figcaption className="text-center">
          Code listing for Example 1.
        </figcaption>
      </figure>
    </div>
  );
}

export function AHDSRExample(props) {
  let renderContext = useContext(RenderContext);
  let vizRef = useRef({
    gate: {
      data: new Float32Array(1024),
      next: 0,
    },
    env: {
      data: new Float32Array(1024),
      next: 0,
    },
  });

  // Instead of setting visible, ask the SpotlightContext to setSpotlight("arExample")
  // Then here I can check spotlightContext.spotlight === "arExample" to identify if this
  // component is the one that should respond to key events. Otherwise I'll get two examples
  // trying to play noise at the same time if they're both visible at the same time.
  let [visible, setVisible] = useState(false);
  let [voiceState, setVoiceState] = useState(getDefaultVoiceState(1));

  let onDraw = (ctx, width, height, frameCount) => {
    ctx.clearRect(0, 0, width, height);
    let numPoints = (vizRef.current.gate.next - 1) % 1024;
    plotLineThroughPoints(ctx, width, height, vizRef.current.gate.data, numPoints,  '#94A3B8');
    plotLineThroughPoints(ctx, width, height, vizRef.current.env.data, numPoints, '#F472B6');
  };

  useEffect(() => {
    if (visible) {
      let renderKeyDown = (e) => {
        if (!e.repeat) {
          setVoiceState(allocateVoice(e, voiceState));
        }
      }

      let renderKeyUp = (e) => setVoiceState(deallocateVoice(e, voiceState));
      let silence = (e) => setVoiceState(deallocateAllVoices(voiceState));

      document.addEventListener('keydown', renderKeyDown);
      document.addEventListener('keyup', renderKeyUp);
      document.addEventListener('visibilitychange', silence);

      return () => {
        document.removeEventListener('keydown', renderKeyDown);
        document.removeEventListener('keyup', renderKeyUp);
        document.removeEventListener('visibilitychange', silence);
      };
    }
  }, [visible, voiceState]);

  useEffect(() => {
    (async () => {
      let core = renderContext.renderer;

      if (renderContext.audioContext && renderContext.audioContext.state === 'suspended') {
        await renderContext.audioContext.resume();
      }

      if (core) {
        let monoOut = el.add(...voiceState.voices.map(function(v, i) {
          let gate = el.const({key: `${v.key}:gate`, value: v.gate});

          let seq = el.sparseq({key: `${v.key}:seq`, seq: [
            { value: 1, tickTime: 0 },
            { value: 0.4, tickTime: 300 },
          ]}, el.train(500), gate);

          let env = el.smooth(el.tau2pole(0.1), el.meter({name: 'gate'}, el.mul(gate, seq)));
          let mapTo = (x, min, max) => el.add(min, el.mul(x, max - min));

          return el.lowpass(
            el.add(
              mapTo(el.meter({name: 'env'}, env), 100, 1800),
              mapTo(el.mul(0.5, el.add(1, el.cycle(0.5))), 100, 1800),
            ),
            0.717,
            el.mul(0.2, env, el.add(
              el.blepsaw(el.smooth(el.tau2pole(0.01), el.const({key: `${v.key}:freq:1`, value: v.freq}))),
              el.blepsaw(el.smooth(el.tau2pole(0.01), el.const({key: `${v.key}:freq:2`, value: v.freq * 1.01}))),
            ))
          );
        }));

        // let [yl, yr] = srvb({
        //   key: 'vrb',
        //   size: 0.5,
        //   decay: 0.7,
        //   mod: 0.2,
        //   mix: 0.3,
        // }, monoOut, monoOut)
        let [yl, yr] = [monoOut, monoOut];

        console.log(core.render(yl, yr));
      }
    })();
  }, [voiceState]);

  useEffect(() => {
    let core = renderContext.renderer;
    let onMeter = (e) => {
      if (e.source === 'gate') {
        vizRef.current.gate.data[vizRef.current.gate.next++ % 1024] = e.max;
      }

      if (e.source === 'env') {
        vizRef.current.env.data[vizRef.current.env.next++ % 1024] = e.max;
      }
    };

    if (core && visible) {
      core.on('meter', onMeter);

      return () => {
        core.off('meter', onMeter);
      }
    }
  }, [visible, renderContext.renderer])

  return (
    <div>
      <VisibilitySensor onChange={(v) => setVisible(v)}>
        <figure>
          <Example>
            <ResizingCanvas className="w-full" onDraw={onDraw} />
          </Example>
          <figcaption className="text-center">
            Example 2: Exponential A(H)DSR envelopes responding to keypress events. The white line
            represents the onset/offset signal, the pink represents the envelope derived by filtering.
          </figcaption>
        </figure>
      </VisibilitySensor>
      <figure>
        {props.children}
        <figcaption className="text-center">
          Code listing for Example 2.
        </figcaption>
      </figure>
    </div>
  );
}

export function RandomEnvelopeExample(props) {
  let renderContext = useContext(RenderContext);
  let vizRef = useRef({
    gate: {
      v1: {
        data: new Float32Array(1024),
        next: 0,
      },
      v2: {
        data: new Float32Array(1024),
        next: 0,
      },
      v3: {
        data: new Float32Array(1024),
        next: 0,
      },
      v4: {
        data: new Float32Array(1024),
        next: 0,
      },
    },
    env: {
      v1: {
        data: new Float32Array(1024),
        next: 0,
      },
      v2: {
        data: new Float32Array(1024),
        next: 0,
      },
      v3: {
        data: new Float32Array(1024),
        next: 0,
      },
      v4: {
        data: new Float32Array(1024),
        next: 0,
      },
    },
  });

  // Instead of setting visible, ask the SpotlightContext to setSpotlight("arExample")
  // Then here I can check spotlightContext.spotlight === "arExample" to identify if this
  // component is the one that should respond to key events. Otherwise I'll get two examples
  // trying to play noise at the same time if they're both visible at the same time.
  let [visible, setVisible] = useState(false);
  let [voiceState, setVoiceState] = useState(getDefaultVoiceState(4));

  let onDraw = (ctx, width, height, frameCount) => {
    ctx.clearRect(0, 0, width, height);
    let numPoints = (vizRef.current.gate.v1.next - 1) % 1024;

    plotLineThroughPoints(ctx, width, height, vizRef.current.gate.v1.data, numPoints, '#94A3B8');
    plotLineThroughPoints(ctx, width, height, vizRef.current.gate.v2.data, numPoints, '#94A3B8');
    plotLineThroughPoints(ctx, width, height, vizRef.current.gate.v3.data, numPoints, '#94A3B8');
    plotLineThroughPoints(ctx, width, height, vizRef.current.gate.v4.data, numPoints, '#94A3B8');

    plotLineThroughPoints(ctx, width, height, vizRef.current.env.v1.data, numPoints, '#F472B6');
    plotLineThroughPoints(ctx, width, height, vizRef.current.env.v2.data, numPoints, '#FB923C');
    plotLineThroughPoints(ctx, width, height, vizRef.current.env.v3.data, numPoints, '#4ADE80');
    plotLineThroughPoints(ctx, width, height, vizRef.current.env.v4.data, numPoints, '#38BDF8');
  };

  useEffect(() => {
    if (visible) {
      let renderKeyDown = (e) => {
        if (!e.repeat) {
          setVoiceState(allocateVoice(e, voiceState));
        }
      }

      let renderKeyUp = (e) => setVoiceState(deallocateVoice(e, voiceState));
      let silence = (e) => setVoiceState(deallocateAllVoices(voiceState));

      document.addEventListener('keydown', renderKeyDown);
      document.addEventListener('keyup', renderKeyUp);
      document.addEventListener('visibilitychange', silence);

      return () => {
        document.removeEventListener('keydown', renderKeyDown);
        document.removeEventListener('keyup', renderKeyUp);
        document.removeEventListener('visibilitychange', silence);
      };
    }
  }, [visible, voiceState]);

  useEffect(() => {
    (async () => {
      let core = renderContext.renderer;

      if (renderContext.audioContext && renderContext.audioContext.state === 'suspended') {
        await renderContext.audioContext.resume();
      }

      if (core) {
        let monoOut = el.add(...voiceState.voices.map(function(v, i) {
          let gate = el.const({key: `${v.key}:gate`, value: v.gate});

          let seq = el.sparseq({key: `${v.key}:seq`, seq: [
            { value: 1, tickTime: 0 },
            { value: v.tc, tickTime: 50 + v.tc * 250 },
          ]}, el.train(500), gate);

          let env = el.smooth(el.tau2pole(el.const({key: `${v.key}:tc`, value: v.tc})), el.meter({name: `${v.key}:gate`}, el.mul(gate, seq)));
          let mapTo = (x, min, max) => el.add(min, el.mul(x, max - min));

          return el.lowpass(
            el.add(
              mapTo(el.meter({name: `${v.key}:env`}, env), 100, 1800),
              mapTo(el.mul(0.5, el.add(1, el.cycle(0.5))), 100, 1800),
            ),
            0.717,
            el.mul(0.2, env, el.add(
              el.blepsaw(el.smooth(el.tau2pole(0.01), el.const({key: `${v.key}:freq:1`, value: v.freq}))),
              el.blepsaw(el.smooth(el.tau2pole(0.01), el.const({key: `${v.key}:freq:2`, value: v.freq * 1.01}))),
            ))
          );
        }));

        // let [yl, yr] = srvb({
        //   key: 'vrb',
        //   size: 0.5,
        //   decay: 0.7,
        //   mod: 0.2,
        //   mix: 0.3,
        // }, monoOut, monoOut)
        let [yl, yr] = [monoOut, monoOut];

        console.log(core.render(yl, yr));
      }
    })();
  }, [voiceState]);

  useEffect(() => {
    let core = renderContext.renderer;

    let onMeter = (e) => {
      let [key, type] = e.source.split(':');

      if (vizRef.current.hasOwnProperty(type) && vizRef.current[type].hasOwnProperty(key)) {
        vizRef.current[type][key].data[vizRef.current[type][key].next++ % 1024] = e.max;
      }
    };

    if (core && visible && vizRef.current) {
      core.on('meter', onMeter);

      return () => {
        core.off('meter', onMeter);
      }
    }
  }, [visible, renderContext.renderer])

  return (
    <div>
      <VisibilitySensor onChange={(v) => setVisible(v)}>
        <figure>
          <Example>
            <ResizingCanvas className="w-full" onDraw={onDraw} />
          </Example>
          <figcaption className="text-center">
            Example 3: Per-voice randomized A(H)DSR envelopes responding to keypress events. Each voice
            draws its onset/offset signal in white, and its envelope in a color assigned to the voice.
          </figcaption>
        </figure>
      </VisibilitySensor>
      <figure>
        {props.children}
        <figcaption className="text-center">
          Code listing for Example 3.
        </figcaption>
      </figure>
    </div>
  );
}
