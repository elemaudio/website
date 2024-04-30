import { el } from '@elemaudio/core';

export function getImportMapScript(version) {
  return `{ "imports": { "@elemaudio/core": "https://cdn.skypack.dev/@elemaudio/core@^${version}" } }`;
}

export class Runtime {
  constructor(audioContext, version) {
    this.ctx = audioContext;
    this.version = version;
    this.core = null;
    this.node = null;
  }

  async init() {
    const pkg = await window.awaitImport(`https://cdn.skypack.dev/@elemaudio/web-renderer@^${this.version}`);
    const WebRenderer = pkg.default;

    this.core = new WebRenderer();
    this.node = await this.core.initialize(this.ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    // TODO: Eventually let's connect mic input here!
    this.node.connect(this.ctx.destination);
  }

  async runUserCode(code, reinitialize = false) {
    try {
      const userModule = await window.awaitImportInline(code);

      // Unpack user exports
      const { getVirtualFileSystem, render } = userModule.default;

      if (reinitialize) {
        if (typeof getVirtualFileSystem === 'function') {
          let decode = (arrayBuffer) => this.ctx.decodeAudioData(arrayBuffer);
          this.core.updateVirtualFileSystem(await getVirtualFileSystem(decode));
        }
      }

      // Run main
      if (typeof render !== 'function')
        throw new Error('Missing render function on default export');

      const userOutput = render();
      // This limiter setting preserves approx. 1 dB of headroom.
      const limit = (input) => el.compress(1, 10, -4, 20, input, input);
      const stats = Array.isArray(userOutput)
        ? await this.core.render(...userOutput.map(limit))
        : await this.core.render(limit(userOutput), limit(userOutput));

      return {
        ok: true,
        stats,
      };
    } catch (e) {
      return {
        ok: false,
        errorMessage: e.message,
      };
    }
  }
}
