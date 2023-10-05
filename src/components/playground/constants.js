// A simple script which evaluates a chunk of code by putting it
// in a Blob and then evaluating it via `await import`, returning
// the evaluated module (or an error) via a Node.js-style callback.
//
// We have to inject it this way because otherwise Next will try to resolve
// the explicit `await import` line in the code below. I believe that for that
// reason we have to use an actual <script> tag with dangerouslySetInnerHTML, rather
// than next/script (which will also try to bundle and optimize).
export const awaitImportScript = `
window.awaitImportInline = async function awaitImportInline(script, callback) {
  const blob = new Blob([script], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);

  try {
    const result = await import(url);
    callback(null, result);
  } catch (e) {
    callback(e, null);
  }
}
`;

export const importMapScript = `
  { "imports": { "@elemaudio/core": "/esm/elemaudio-core-2.0.0-alpha.0.js" } }
`;

export const defaultEditorValue = `
import {el} from '@elemaudio/core';


export default {
  getInitialState() {},
  getVirtualFileSystem() {},
  applyInputEvent(currentState, evt) {},
  shouldRender(prevState, newState) {},
  updateRefs(state, refs, sampleRate) {},
  render(state, refs, sampleRate) {
     let fc = refs.getOrCreate("cutoff1", "const", {value: 440}, []);

     core.render(el.lowpass(fc, 1, el.saw()));
  }
}
`.trim();

