import React, { useState, useContext, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Head from 'next/head';

import { RenderContext } from '@/lib/RenderContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultEditorValue, awaitImportScript, importMapScript } from './constants';
import { Controls } from './controls';
import { InfoPanel } from './info';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';


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
  const queryString = useSearchParams();
  const [isRunning, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Not running");
  const [shareMessage, setShareMessage] = useState("");
  const [editorValue, setEditorValue] = useState(defaultEditorValue.trim());

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
    if (!renderContext.audioContext)
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

    let res = await runUserCode(renderContext, editorValue);
    setStatusMessage(res.ok ? formatStats(res.stats) : res.errorMessage);
    setRunning(true);
  }, [renderContext, isRunning, editorValue]);

  const onChange = useCallback(async (editorContent) => {
    setEditorValue(editorContent);

    if (!isRunning)
      return;

    let res = await runUserCode(renderContext, editorContent);
    setStatusMessage(res.ok ? formatStats(res.stats) : res.errorMessage);
  }, [renderContext, isRunning, editorValue]);

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
