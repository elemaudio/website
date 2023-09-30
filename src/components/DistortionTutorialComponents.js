import React, { useState, useEffect, useRef, useContext } from 'react';
import { PlayIcon, PauseIcon, AdjustmentsIcon } from '@heroicons/react/24/outline'

import ResizingCanvas from './ResizingCanvas';
import { RenderContext } from '@/lib/RenderContext';
import { el } from '@elemaudio/core';


function minmax(arr) {
  return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
}

function stepEx01(ctx, val, width, height, frameCount) {
  const mh = height * 0.5;
  const mw = width * 0.5;

  ctx.clearRect(0, 0, width, height);

  // Paint the grid
  ctx.beginPath();
  ctx.moveTo(0, mh);
  ctx.lineTo(width, mh);
  ctx.moveTo(mw, 0);
  ctx.lineTo(mw, height);

  // Paint tanh curve
  ctx.moveTo(0, height);

  for (let i = 0; i < width; ++i) {
    let n = (mw - i) / mh;
    ctx.lineTo(i, mh + mh * (Math.tanh(n)));
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Paint what should be sin(x)
  ctx.beginPath();
  ctx.moveTo(0, mh);

  for (let i = 1; i < width; ++i) {
    ctx.lineTo(i, mh - mh * val * Math.sin((i / 44100) * 440 * Math.PI));
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Paint what we see with tanh(sin(x))
  ctx.beginPath();
  ctx.moveTo(0, mh);

  for (let i = 1; i < width; ++i) {
    ctx.lineTo(i, mh - mh * val * Math.tanh(val * 4 * Math.sin((i / 44100) * 440 * Math.PI)));
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#A5F3FC';
  ctx.stroke();
}

function stepEx02(ctx, playing, data, width, height, frameCount) {
  const samplesPerPixel = 128;
  const pixelsPerFrame = (data.length / samplesPerPixel);
  const startX = frameCount * pixelsPerFrame;

  if (!playing) {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  for (let i = 0; i < (data.length / samplesPerPixel); ++i) {
    let mh = height * 0.5;
    let x = (startX + i) % width;
    let [min, max] = minmax(data.slice(i * samplesPerPixel, ((i + 1) * samplesPerPixel) - 1));

    ctx.clearRect(x, 0, 1, height);
    ctx.fillStyle = '#A5F3FC';
    ctx.fillRect(x, mh + (min * mh), 1, (max - min) * mh);
  }
}
function TutorialExample(props) {
  const {
    playing,
    sliderValue,
    onPlay,
    onPause,
    onSliderChange,
    onDraw,
    ...other
  } = props;

  return (
    <div {...other}>
      <ResizingCanvas className="w-full" onDraw={onDraw} />
      <div className="absolute left-3 bottom-2">
        <button className="inline-block text-gray-400 w-8 m-1" onClick={playing ? onPause : onPlay}>
          {playing ? (<PauseIcon className="text-gray-100" />) : (<PlayIcon className="text-gray-400" />)}
        </button>
        <input type="range" min="0" max="1" step="0.001" className="inline-block w-32 m-1" onChange={onSliderChange} value={sliderValue} disabled={!playing} />
      </div>
    </div>
  );
}

export function Example01(props) {
  let renderContext = useContext(RenderContext);
  let [playing, setPlaying] = useState(false);
  let [sliderValue, setSliderValue] = useState(0.5);

  let playExample = async () => {
    if (!renderContext.audioContext)
      return;

    if (renderContext.audioContext.state === 'suspended') {
      await renderContext.audioContext.resume();
    }

    setPlaying(true);
  };

  let pauseExample = () => {
    setPlaying(false);
  };

  let tweakExample = (value) => {
    if (!playing)
      return;

    setSliderValue(value);
  };

  useEffect(() => {
    let core = renderContext.renderer;

    if (!renderContext.audioContext)
      return;

    if (!playing) {
      core.render(
        el.const({value: 0}),
        el.const({value: 0}),
      );

      return;
    }

    let vs = el.sm(el.const({key: 'ex1:mix', value: sliderValue * 4}));
    let gs = el.sm(el.const({key: 'ex1:gain', value: (1.2 - Math.sqrt(sliderValue))}));

    let dry = el.mul(vs, el.cycle(440));
    let wet = el.tanh(dry);

    core.render(
      el.mul(gs, wet),
      el.mul(gs, wet),
    )
  }, [renderContext, playing, sliderValue]);

  return (
    <>
      <figure>
        <TutorialExample
          className="relative w-full bg-slate-800 rounded-md"
          playing={playing}
          sliderValue={sliderValue}
          onPlay={playExample}
          onPause={pauseExample}
          onSliderChange={(e) => tweakExample(parseFloat(e.target.value))}
          onDraw={(ctx, w, h, fc) => stepEx01(ctx, sliderValue, w, h, fc)} />
        <figcaption className="text-center">
          Example 1. Drag the slider to apply different gain to the sine wave. Note how the output shape changes
          at larger gain values (original sine wave shape shown in gray).
        </figcaption>
      </figure>
      <figure>
        {props.children}
        <figcaption className="text-center">
          Code listing for Example 1.
        </figcaption>
      </figure>
    </>
  );
}

export function Example02(props) {
  let renderContext = useContext(RenderContext);
  let [playing, setPlaying] = useState(false);
  let [sliderValue, setSliderValue] = useState(0.5);

  let dataRef = useRef({
    buffer: new Float32Array(512),
  });

  let playExample = async () => {
    if (!renderContext.audioContext)
      return;

    if (renderContext.audioContext.state === 'suspended') {
      await renderContext.audioContext.resume();
    }

    setPlaying(true);
  };

  let pauseExample = () => {
    setPlaying(false);
  };

  let tweakExample = (value) => {
    if (!playing)
      return;

    setSliderValue(value);
  };

  useEffect(() => {
    let core = renderContext.renderer;

    if (!renderContext.audioContext)
      return;

    if (!playing) {
      core.render(
        el.const({value: 0}),
        el.const({value: 0}),
      );

      return;
    }

    core.removeAllListeners('scope');
    core.on('scope', function(e) {
      dataRef.current.buffer = e.data[0];
    });

    let t = el.train(0.25);
    let sl = el.sample({path: '96_Gm_MelodicSynth_01_592.wav:0'}, t, 1);
    let sr = el.sample({path: '96_Gm_MelodicSynth_01_592.wav:1'}, t, 1);

    let dl = el.mul(0.75, sl);
    let dr = el.mul(0.75, sr);

    let wl = el.mul(0.25, el.tanh(el.mul(10, el.lowpass(1800, 0.4, sl))));
    let wr = el.mul(0.25, el.tanh(el.mul(10, el.lowpass(1800, 0.4, sr))));

    let vs = el.sm(el.const({key: 'ex2:mix', value: sliderValue}));

    core.render(
      el.scope(el.select(vs, wl, dl)),
      el.select(vs, wl, dl),
    );
  }, [renderContext, playing, sliderValue]);

  return (
    <>
      <figure>
        <TutorialExample
          className="relative w-full bg-slate-800 rounded-md"
          playing={playing}
          sliderValue={sliderValue}
          onPlay={playExample}
          onPause={pauseExample}
          onSliderChange={(e) => tweakExample(parseFloat(e.target.value))}
          onDraw={(ctx, w, h, fc) => stepEx02(ctx, playing, dataRef.current.buffer, w, h, fc)} />
        <figcaption className="text-center">
          Example 2. Drag the slider to adjust the distortion amount on the playing sample. To the left, no
          effect is applied, to the right, the maximal distortion effect is applied.
        </figcaption>
      </figure>
      <figure>
        {props.children}
        <figcaption className="text-center">
          Code listing for Example 2.
        </figcaption>
      </figure>
    </>
  );
}

export function Example03(props) {
  let renderContext = useContext(RenderContext);
  let [playing, setPlaying] = useState(false);
  let [sliderValue, setSliderValue] = useState(0.5);

  let dataRef = useRef({
    buffer: new Float32Array(512),
  });

  let playExample = async () => {
    if (!renderContext.audioContext)
      return;

    if (renderContext.audioContext.state === 'suspended') {
      await renderContext.audioContext.resume();
    }

    setPlaying(true);
  };

  let pauseExample = () => {
    setPlaying(false);
  };

  let tweakExample = (value) => {
    if (!playing)
      return;

    setSliderValue(value);
  };

  useEffect(() => {
    let core = renderContext.renderer;

    if (!renderContext.audioContext)
      return;

    if (!playing) {
      core.render(
        el.const({value: 0}),
        el.const({value: 0}),
      );

      return;
    }

    core.removeAllListeners('scope');
    core.on('scope', function(e) {
      dataRef.current.buffer = e.data[0];
    });

    let t = el.train(0.25);

    // Our left and right channel sample playback
    let sl = el.sample({path: '96_Gm_MelodicSynth_01_592.wav:0'}, t, 1);
    let sr = el.sample({path: '96_Gm_MelodicSynth_01_592.wav:1'}, t, 1);

    // Here we construct a piecewise waveshaper function with:
    //   f(x), x >= 0 : tanh(x)
    //   f(x), x <  0 : tanh(sinh(x)) - 0.2 * x * sin(pi * x)
    let table = (new Float32Array(513)).fill(0);

    for (let i = 0; i < 256; ++i) {
      let leftX = (256 - i) / -256;
      let rightX = i / 256;

      table[257 + i] = Math.tanh(rightX);
      table[i] = Math.tanh(Math.sinh(leftX)) - 0.3 * leftX * Math.sin(Math.PI * leftX * 2);
    }

    // Update our virtual file system
    core.updateVirtualFileSystem({
      '/waveshaper/asym1': table,
    });

    // Our pre-distortion left and right channels. We drive the dry signals so that they'll
    // hit the nonlinear parts of our curve. We pre-filter with a subtle lowpass, and we sweep
    // a slow DC offset (bias) to push the signal into different regions of the wave shaper.
    let dl = el.add(el.mul(0.1, el.cycle(1)), el.mul(10, el.smooth(0.6, sl)));
    let dr = el.add(el.mul(0.1, el.cycle(1)), el.mul(10, el.smooth(0.6, sr)));

    // Now we map our signal through the waveshaping table to derive our wet signals. We
    // use a DC blocker to remove any lingering DC component, then gain down to a reasonable
    // volume
    let wl = el.mul(0.2, el.dcblock(el.table({path: '/waveshaper/asym1'}, el.mul(0.5, el.add(1, dl)))));
    let wr = el.mul(0.2, el.dcblock(el.table({path: '/waveshaper/asym1'}, el.mul(0.5, el.add(1, dr)))));

    let vs = el.sm(el.const({key: 'ex3:mix', value: sliderValue}));

    core.render(
      el.scope(el.select(vs, wl, sl)),
      el.select(vs, wr, sr),
    );
  }, [renderContext, playing, sliderValue]);

  return (
    <>
      <figure>
        <TutorialExample
          className="relative w-full bg-slate-800 rounded-md"
          playing={playing}
          sliderValue={sliderValue}
          onPlay={playExample}
          onPause={pauseExample}
          onSliderChange={(e) => tweakExample(parseFloat(e.target.value))}
          onDraw={(ctx, w, h, fc) => stepEx02(ctx, playing, dataRef.current.buffer, w, h, fc)} />
        <figcaption className="text-center">
          Example 3. An aggressive asymmetric distortion which uses a simple tanh saturation curve above the origin,
          and an intense folding curve below.
        </figcaption>
      </figure>
      <figure>
        {props.children}
        <figcaption className="text-center">
          Code listing for Example 3.
        </figcaption>
      </figure>
    </>
  );
}
