import React, { useState, useContext, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Head from 'next/head';

import { RenderContext } from '@/lib/RenderContext';
import { getImportMapScript, Runtime } from './runtime';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultEditorValue, awaitImportScript, importMapScript } from './constants';
import { Controls } from './controls';
import { InfoPanel } from './info';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';


function formatStats(stats) {
  const {
    elapsedTimeMs,
    nodesAdded,
    edgesAdded,
    propsWritten,
  } = stats;

  return `Ok (${elapsedTimeMs.toFixed(2)}ms). Nodes: ${nodesAdded}, Edges: ${edgesAdded},  Props: ${propsWritten}`;
}

export function Playground() {
  const renderContext = useContext(RenderContext);
  const router = useRouter();
  const queryString = useSearchParams();
  const [isRunning, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Not running");
  const [shareMessage, setShareMessage] = useState("");
  const [editorValue, setEditorValue] = useState(defaultEditorValue.trim());
  const [runtime, setRuntimeInstance] = useState(null);

  // Mount the runtime
  useEffect(() => {
    if (!renderContext.audioContext)
      return;

    let ri = new Runtime(renderContext.audioContext, '3.0.0');

    ri.init().then(() => {
      setRuntimeInstance(ri);
    });
  }, [renderContext.audioContext]);

  // Handle query param routing
  useEffect(() => {
    const hasCodeQuery = queryString.has('code') &&
      queryString.get('code').length > 0;

    if (hasCodeQuery) {
      try {
        setEditorValue(decompressFromEncodedURIComponent(queryString.get('code')));
      } catch (e) {
        // If we fail to decompress then let's just navigate away
        router.push('/playground');
      }
    } else {
      setEditorValue(defaultEditorValue.trim());
    }
  }, [queryString.get('version'), queryString.get('code')]);

  const onPlayPause = useCallback(async (e) => {
    if (!renderContext.audioContext || !runtime)
      return;

    if (isRunning) {
      await renderContext.audioContext.suspend();
      // TODO: just one `setStatus`? Which includes { running, message }
      setRunning(false);
      return setStatusMessage('Not running');
    }

    if (renderContext.audioContext.state === 'suspended') {
      await renderContext.audioContext.resume();
    }

    let res = await runtime.runUserCode(editorValue, true);
    setStatusMessage(res.ok ? formatStats(res.stats) : res.errorMessage);
    setRunning(true);
  }, [renderContext, runtime, isRunning, editorValue]);

  const onChange = useCallback(async (editorContent) => {
    setEditorValue(editorContent);

    if (!isRunning || !runtime)
      return;

    let res = await runtime.runUserCode(editorContent);
    setStatusMessage(res.ok ? formatStats(res.stats) : res.errorMessage);
  }, [runtime, isRunning, editorValue]);

  const onShare = useCallback(async (e) => {
    try {
      const shareUrl = `${document.location.origin}/playground/?version=3.0.0&code=${compressToEncodedURIComponent(editorValue)}`;
      await navigator.clipboard.writeText(shareUrl);

      router.push(shareUrl);
      setShareMessage("Share link copied to clipboard")
    } catch (e) {
      setShareMessage("Failed to generate share link");
    }

    setTimeout(() => {
      setShareMessage("");
    }, 2000);
  }, [editorValue]);


  return (
    <div className="el__full-height w-full flex flex-col">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
        <script dangerouslySetInnerHTML={{ __html: awaitImportScript }} />
        <script type="importmap" dangerouslySetInnerHTML={{ __html: getImportMapScript('3.0.0') }} />
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
        <div className="h-[78vh] flex-1">
          <InfoPanel />
        </div>
      </div>
      <div className="flex-1">
        <Controls
          isRunning={isRunning}
          statusMessage={statusMessage}
          onPlayPause={onPlayPause}
          onShare={onShare}
          shareMessage={shareMessage} />
      </div>
    </div>
  );
}
