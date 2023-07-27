import { history } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';
import { search, searchKeymap } from '@codemirror/search';
import { Extension, StateEffect, StateField } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';

const syntaxErrorMark = Decoration.mark({ class: 'cm-errormark' });
const justifiedMark = Decoration.mark({ class: 'cm-justifiedmark' });
const notJustifiedMark = Decoration.mark({ class: 'cm-notjustifiedmark' });

const tutchHighlightTheme = EditorView.baseTheme({
  '.cm-errormark': { background: 'rgba(204, 153, 0, .2)' },
  '.cm-justifiedmark': { background: 'rgba(0, 0, 204, .2)' },
  '.cm-notjustifiedmark': { background: 'rgba(204, 0, 0, .2)' },
});

export const clearMarks = StateEffect.define<{}>({});

export const addErrorMark = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
});

export const addJustificationMarks = StateEffect.define<
  { from: number; to: number; justified: boolean }[]
>({
  map: (ranges, change) =>
    ranges.map(({ from, to, justified }) => ({
      from: change.mapPos(from),
      to: change.mapPos(to),
      justified,
    })),
});

const tutchHighlightMarks = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    console.log({ decorations, tr });

    // Always update existing decorations to account for text changes
    decorations = decorations.map(tr.changes);

    // Replace all existing decorations if there is a new syntax highlight mark or new set of
    // justification marks
    for (let effect of tr.effects) {
      if (effect.is(addErrorMark)) {
        return Decoration.set(syntaxErrorMark.range(effect.value.from, effect.value.to));
      }
      if (effect.is(addJustificationMarks)) {
        return Decoration.set(
          effect.value.map(({ from, to, justified }) =>
            (justified ? justifiedMark : notJustifiedMark).range(from, to),
          ),
        );
      }
      if (effect.is(clearMarks)) {
        return Decoration.none;
      }
    }

    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const extensions: Extension[] = [
  lineNumbers(),
  highlightActiveLineGutter(),
  history(),
  drawSelection(),
  dropCursor(),
  bracketMatching(),
  search(),
  keymap.of([...searchKeymap]),
  tutchHighlightTheme,
  tutchHighlightMarks,
];
