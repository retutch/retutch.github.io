import React from 'react';
import useCodeEditor from './editor/useCodeEditor';
import { addErrorMark, addJustificationMarks, clearMarks, extensions } from './editor/extensions';
import { Justification, ParsingError, evaluate, parse } from 'tutch';
import { EditorView } from 'codemirror';
import { TutchResponse } from './types';
import TutchDisplay from './TutchDisplay';

const INIT_PROGRAM = `
proof triv: T =
begin
T
end;
`.trim();

function Tutch() {
  const [value, setValue] = React.useState(INIT_PROGRAM);
  const [tutchResponse, setTutchResponse] = React.useState<TutchResponse>({ state: 'Waiting' });
  const { ref, view, editorIsOutOfDate } = useCodeEditor({
    value,
    extensions: extensions,
    onChange: updateTutch,
    delayChange: 1000,
  });

  function updateTutch(view: EditorView, str: string) {
    setValue(str);
    if (!view) return;
    try {
      const ast = parse(str);
      const justifications = evaluate(ast);
      setTutchResponse({ state: 'HasJustifications', justifications });
      dispatchCodeMirrorJustifications(view, justifications);
    } catch (err) {
      if ((err as any).name === 'ParsingError') {
        const parsingError = err as ParsingError;
        setTutchResponse({
          state: 'ExpectedError',
          contents: parsingError,
        });
        dispatchCodeMirrorSyntaxErrors(view, parsingError);
      } else {
        setTutchResponse({
          state: 'UnexpectedError',
          msg: `Unexpected error: ${JSON.stringify(err)}`,
        });
        view.dispatch({ effects: clearMarks.of({}) });
      }
    }
  }

  React.useEffect(() => {
    if (editorIsOutOfDate) {
      view?.dispatch({ effects: clearMarks.of({}) });
    }
  }, [editorIsOutOfDate]);

  React.useEffect(() => {
    if (!view) return;
    updateTutch(view, INIT_PROGRAM);
  }, [view === null]);

  return (
    <>
      <div ref={ref}></div>
      <TutchDisplay tutchResponse={editorIsOutOfDate ? { state: 'Waiting' } : tutchResponse} />
    </>
  );
}

function dispatchCodeMirrorJustifications(view: EditorView, justifications: Justification[]) {
  view.dispatch({
    effects: addJustificationMarks.of(
      justifications
        .map((justification) => {
          return {
            from:
              view.state.doc.line(justification.loc.start.line).from +
              justification.loc.start.column -
              1,
            to:
              view.state.doc.line(justification.loc.end.line).from +
              justification.loc.end.column -
              1,
            justified: justification.type === 'Justified',
          };
        })
        .filter((x): x is { from: number; to: number; justified: boolean } => x !== null)
        .sort((a, b) => a.from - b.from),
    ),
  });
}

function dispatchCodeMirrorSyntaxErrors(view: EditorView, error: ParsingError) {
  if (error.loc === null) {
    return;
  }

  view.dispatch({
    effects: addErrorMark.of({
      from: view.state.doc.line(error.loc.start.line).from + error.loc.start.column - 1,
      to: view.state.doc.line(error.loc.end.line).from + error.loc.end.column - 1,
    }),
  });
}

export default Tutch;
