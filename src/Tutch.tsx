import React from 'react';
import useCodeEditor from './editor/useCodeEditor';
import { addErrorMark, addJustificationMarks, clearMarks, extensions } from './editor/extensions';
import { Justification, ParsingError, evaluate, parse } from 'tutch';
import { EditorView } from 'codemirror';

const INIT_PROGRAM = `
proof triv: T =
begin
T
end;
`.trim();

function Tutch() {
  const [value, setValue] = React.useState(INIT_PROGRAM);
  const [response, setResponse] = React.useState<
    | { error: true; expected: false; msg: string }
    | { error: true; expected: true; contents: ParsingError }
    | { error: false; justifications: Justification[] }
    | null
  >(null);
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
      setResponse({ error: false, justifications });
      view.dispatch({
        effects: addJustificationMarks.of(
          justifications
            .map((justification) => {
              const lineStart = view.state.doc.line(justification.loc.start.line);
              const lineEnd = view.state.doc.line(justification.loc.end.line);
              return {
                from: lineStart.from + justification.loc.start.column - 1,
                to: lineEnd.from + justification.loc.end.column - 1,
                justified: justification.type === 'Justified',
              };
            })
            .filter((x): x is { from: number; to: number; justified: boolean } => x !== null)
            .sort((a, b) => a.from - b.from),
        ),
      });
    } catch (err) {
      if ((err as any).name !== 'ParsingError') {
        setResponse({
          error: true,
          expected: false,
          msg: `Unexpected error: ${JSON.stringify(err)}`,
        });
        view.dispatch({ effects: clearMarks.of({}) });
      } else {
        const parsingError = err as ParsingError;
        setResponse({
          error: true,
          expected: true,
          contents: parsingError,
        });
        if (parsingError.loc !== null) {
          const lineStart = view.state.doc.line(parsingError.loc.start.line);
          const lineEnd = view.state.doc.line(parsingError.loc.end.line);
          view.dispatch({
            effects: addErrorMark.of({
              from: lineStart.from + parsingError.loc.start.column - 1,
              to: lineEnd.from + parsingError.loc.end.column - 1,
            }),
          });
        }
      }
    }
  }

  React.useEffect(() => {
    if (!view) return;
    updateTutch(view, INIT_PROGRAM);
  }, [view === null]);

  return (
    <>
      <div ref={ref}></div>
      <pre>
        {editorIsOutOfDate || response === null
          ? '...'
          : response.error === true && response.expected
          ? JSON.stringify(response.contents, null, 2)
          : response.error === true
          ? response.msg
          : JSON.stringify(response.justifications, null, 2)}
      </pre>
    </>
  );
}

export default Tutch;
