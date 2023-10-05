import React, { useState, useContext, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Head from 'next/head';

import { RenderContext } from '@/lib/RenderContext';
import { useRouter } from 'next/router';
import { defaultEditorValue, awaitImportScript, importMapScript } from './constants';
import { Controls } from './controls';


async function runUserCode(renderContext, code) {
  try {
    const userModule = await window.awaitImportInline(code);

    // Unpack user exports
    const { getVirtualFileSystem, render } = userModule.default;

    if (typeof getVirtualFileSystem === 'function') {
      // yaya
    }

    // Run main
    if (typeof render !== 'function')
      throw new Error('Missing render function on default export');

    const userOutput = render({});
    const stats = Array.isArray(userOutput)
      ? renderContext.renderer.render(...userOutput)
      : renderContext.renderer.render(userOutput, userOutput);

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

function formatStats(stats) {
  const {
    elapsedTimeMs,
    nodesAdded,
    edgesAdded,
    propsWritten,
  } = stats;

  return `Ok (${elapsedTimeMs}ms A${nodesAdded} E${edgesAdded} P${propsWritten})`;
}

export function Playground() {
  const renderContext = useContext(RenderContext);
  const router = useRouter();
  const [isRunning, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Not running");
  const [editorValue, setEditorValue] = useState(defaultEditorValue.trim());

  const onPlayPause = useCallback(async (e) => {
    if (!renderContext.audioContext)
      return;

    if (renderContext.audioContext.state === 'suspended') {
      await renderContext.audioContext.resume();
    }

    let res = await runUserCode(renderContext, editorValue);

    if (!res.ok) {
      return setStatusMessage(res.errorMessage);
    }

    setRunning(true);
    setStatusMessage(formatStats(res.stats));
  }, [renderContext, editorValue]);

  const onChange = useCallback(async (editorContent) => {
    if (!isRunning)
      return;

    let res = await runUserCode(renderContext, editorContent);

    if (!res.ok) {
      return setStatusMessage(res.errorMessage);
    }

    setStatusMessage(formatStats(res.stats));
  }, [isRunning, editorValue]);

  return (
    <div className="el__full-height w-full flex flex-col">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
        <script dangerouslySetInnerHTML={{ __html: awaitImportScript }} />
        <script type="importmap" dangerouslySetInnerHTML={{ __html: importMapScript }} />
      </Head>
      <div className="flex-0 flex">
        <div className="h-[78vh] flex-1">
          <Editor
            className="w-full"
            height="78vh"
            theme="vs-dark" // or "light"
            defaultLanguage="javascript"
            options={{ minimap: { enabled: false }}}
            onChange={onChange}
            value={editorValue} />
        </div>
        <div className="h-[78vh] flex-1 bg-slate-300" />
      </div>
      <div className="flex-1">
        <Controls
          isRunning={isRunning}
          statusMessage={statusMessage}
          onPlayPause={onPlayPause} />
      </div>
    </div>
  );
}
