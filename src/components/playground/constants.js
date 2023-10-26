// A simple script which evaluates a chunk of code by putting it
// in a Blob and then evaluating it via `await import`, returning
// the evaluated module (or an error).
//
// We have to inject it this way because otherwise Next will try to resolve
// the explicit `await import` line in the code below. I believe that for that
// reason we have to use an actual <script> tag with dangerouslySetInnerHTML, rather
// than next/script (which will also try to bundle and optimize).
export const awaitImportScript = `
window.awaitImport = async function awaitImport(url) {
  return await import(url);
}

window.awaitImportInline = async function awaitImportInline(code) {
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);

  return await import(url);
}
`;

export const importMapScript = `
  { "imports": { "@elemaudio/core": "https://cdn.skypack.dev/@elemaudio/core@3.0.0" } }
`;

export const defaultEditorValue = `
import {el} from '@elemaudio/core';


export default {
  render() {
    return el.cycle(440);
  }
}
`.trim();

