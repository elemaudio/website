import React, { useState, useContext, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';

import { defaultEditorValue } from './constants';
import { Controls } from './controls';



function onChange(editorContent) {
  console.log(editorContent);
}

export function Playground() {
  return (
    <div className="el__full-height w-full flex flex-col">
      <div className="flex-0 flex">
        <div className="h-[78vh] flex-1">
          <Editor
            className="w-full"
            height="78vh"
            theme="vs-dark" // or "light"
            options={{ minimap: { enabled: false }}}
            onChange={onChange}
            defaultLanguage="javascript"
            defaultValue={defaultEditorValue} />
        </div>
        <div className="h-[78vh] flex-1 bg-slate-300" />
      </div>
      <div className="flex-1">
        <Controls />
      </div>
    </div>
  );
}
