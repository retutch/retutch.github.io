import { EditorView, ViewUpdate } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import React from 'react';

import useCodeMirror from './useCodeMirror';

type OnChange<T> = (view: EditorView, update: T) => void;

function onUpdate(onChange: (update: ViewUpdate) => void) {
  return EditorView.updateListener.of((update: ViewUpdate) => {
    if (update.docChanged) {
      onChange(update);
    }
  });
}

function useDelayedState<T>(
  initialValue: T,
  pauseTime: number,
  onChange: OnChange<T>,
  process: (x: ViewUpdate) => T,
): [T, (update: ViewUpdate) => void, boolean] {
  const [delayedValue, setDelayedValue] = React.useState(initialValue);
  const [valueIsChanging, setValueIsChanging] = React.useState(false);
  const index = React.useRef(0);
  const instantaneousValue = React.useRef<null | ViewUpdate>(null);

  return [
    delayedValue,
    (update: ViewUpdate) => {
      index.current += 1;
      instantaneousValue.current = update;
      setValueIsChanging(true);
      const indexNow = index.current;
      setTimeout(() => {
        if (indexNow === index.current && instantaneousValue.current) {
          const processedValue = process(instantaneousValue.current);
          setDelayedValue(processedValue);
          setValueIsChanging(false);
          onChange(update.view, processedValue);
        }
      }, pauseTime);
    },
    valueIsChanging,
  ];
}

export default function useCodeEditor(args: {
  value: string;
  extensions: Extension[];
  onChange: OnChange<string>;
  delayChange: number;
}) {
  const [knownValue, setKnownValue, knownValueIsChanging] = useDelayedState(
    args.value,
    args.delayChange,
    args.onChange,
    (update: ViewUpdate) => update.state.doc.toString(),
  );

  const { ref, view } = useCodeMirror(args.value, [onUpdate(setKnownValue), ...args.extensions]);

  React.useEffect(() => {
    if (view) {
      if (args.value !== knownValue) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: args.value,
          },
        });
      }
    }
  }, [args.value, knownValue, view]);

  return { ref, editorIsOutOfDate: knownValueIsChanging, view };
}
