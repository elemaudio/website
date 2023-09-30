import React, { useState, useEffect } from 'react';
import WebRenderer from '@elemaudio/web-renderer';


export const RenderContext = React.createContext({
  audioContext: null,
  renderer: null,
});

// TODO: Take the virtual file system as props, that's neat
export function RenderContextProvider(props) {
  const [renderContext, setRenderContext] = useState({
    audioContext: null,
    renderer: null,
  });

  useEffect(() => {
    (async () => {
      let audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let core = new WebRenderer();

      // Loading into the virtual file system for the tutorials
      let response = await fetch('/audio/96_Gm_MelodicSynth_01_592.wav');
      let sampleBuffer = await audioContext.decodeAudioData(await response.arrayBuffer());

      core.on('load', async function() {
        setRenderContext({
          audioContext,
          renderer: core,
        });
      }, []);

      let node = await core.initialize(audioContext, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        processorOptions: {
          virtualFileSystem: {
            '96_Gm_MelodicSynth_01_592.wav:0': sampleBuffer.getChannelData(0),
            '96_Gm_MelodicSynth_01_592.wav:1': sampleBuffer.getChannelData(1),
          }
        }
      });

      node.connect(audioContext.destination);
    })();
  }, [])

  return (
    <RenderContext.Provider value={renderContext}>
      {props.children}
    </RenderContext.Provider>
  );
}
