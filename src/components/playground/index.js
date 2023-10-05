import React, { useState, useContext, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';

import { defaultEditorValue } from './constants';



function onChange(editorContent) {
  console.log(editorContent);
}

export function Playground() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-0 bg-slate-100 flex">
        <div className="h-[77vh] flex-1">
          <Editor
            className="w-full"
            height="77vh"
            theme="vs-dark" // or "light"
            options={{ minimap: { enabled: false }}}
            onChange={onChange}
            defaultLanguage="javascript"
            defaultValue={defaultEditorValue} />
        </div>
        <div className="h-[77vh] flex-1 bg-slate-300" />
      </div>
      <div className="flex-1 bg-slate-200"></div>
    </div>
  );
}

