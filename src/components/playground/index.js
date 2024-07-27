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
  const [outdatedBrowser, setOutdatedBrowser] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  // Mount the runtime
  useEffect(() => {
    if (!renderContext.audioContext)
      return;

    (async function() {
      try {
        // First we check if the browser can even run our import map specification for
        // elem core, because import maps are apparently a fairly new feature
        const test = await window.awaitImport('@elemaudio/core');
      } catch (e) {
        setOutdatedBrowser(true);
      }

      try {
        // Next we try to initialize the runtime
        const ri = new Runtime(renderContext.audioContext, '3.2.0');

        await ri.init();
        setRuntimeInstance(ri);
      } catch (e) {
        setStatusMessage('Failed to initialize the runtime');
      }
    })();

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
      const shareUrl = `${document.location.origin}/playground/?version=3.2.0&code=${compressToEncodedURIComponent(editorValue)}`;
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

  const toggleInfoPanel = useCallback(() => {
    setShowInfoPanel(prevShowInfoPanel => !prevShowInfoPanel);
  }, []);



  return (
    <div className="flex flex-col w-auto el__full-height">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
        <script dangerouslySetInnerHTML={{ __html: awaitImportScript }} />
        <script type="importmap" dangerouslySetInnerHTML={{ __html: getImportMapScript('3.2.0') }} />
      </Head>
      <div className="flex flex-0">
        <div className="h-[78vh] flex-1">
          <Editor
            width={ showInfoPanel ? "95%" : "100%" }
            height="78vh"
            theme="vs-dark" // or "light"
            defaultLanguage="javascript"
            options={{ 
              minimap: { enabled: false },
              fontSize: 16,
            }
            }
            onChange={onChange}
            value={editorValue} />
        </div>

        { showInfoPanel && <div className="flex-1 h-[78vh]" > 
          <InfoPanel outdatedBrowser={outdatedBrowser} />
        </div> }
      
       
      </div>
      <div className="flex-1">
        <Controls
          isRunning={isRunning}
          statusMessage={statusMessage}
          onPlayPause={onPlayPause}
          onShare={onShare}
          shareMessage={shareMessage} 
          toggleInfoPanel={toggleInfoPanel}/>
      </div>
    </div>
  );
}
