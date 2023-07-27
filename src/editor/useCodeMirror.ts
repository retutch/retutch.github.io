import React from 'react';

import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export default function useCodeMirror(initialValue: string, extensions: Extension[]) {
  const editor = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<EditorView | null>(null);

  React.useEffect(() => {
    const startState = EditorState.create({
      doc: initialValue,
      extensions: extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editor.current || undefined,
    });
    setView(view);

    return () => {
      view.destroy();
      setView(null);
    };
  }, []);

  return { ref: editor, view };
}
