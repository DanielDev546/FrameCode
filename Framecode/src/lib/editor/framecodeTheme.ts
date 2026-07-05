import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Pulled directly from FrameCode's IDE mockup — keep this as the single
// source of truth if the brand palette ever shifts.
const colors = {
  bg: "#070b12",
  bgPanel: "#050810",
  bgActiveLine: "rgba(255, 255, 255, 0.03)",
  bgSelection: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.05)",
  text: "#e8edf5",
  dim: "#5a6478",
  faint: "#3a4154",
  green: "#00ff88",
  cyan: "#00d4ff",
  amber: "#ffb340",
  coral: "#ff8c69",
};

export const framecodeTheme = EditorView.theme(
  {
    "&": {
      color: colors.text,
      backgroundColor: colors.bg,
      fontSize: "12px",
    },
    ".cm-content": {
      caretColor: colors.green,
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: "1.7",
      padding: "16px 0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: colors.green,
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: `${colors.bgSelection} !important`,
      },
    ".cm-activeLine": {
      backgroundColor: colors.bgActiveLine,
    },
    ".cm-gutters": {
      backgroundColor: colors.bg,
      color: colors.faint,
      border: "none",
      borderRight: `1px solid ${colors.border}`,
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: colors.dim,
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 12px 0 8px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "12px",
    },
    ".cm-scroller": {
      fontFamily: "'JetBrains Mono', monospace",
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
      backgroundColor: "rgba(0, 255, 136, 0.15)",
      outline: `1px solid ${colors.green}`,
    },
    ".cm-selectionMatch": {
      backgroundColor: "rgba(0, 212, 255, 0.1)",
    },
    ".cm-tooltip": {
      backgroundColor: colors.bgPanel,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: colors.bgActiveLine,
      color: colors.text,
    },
    ".cm-panels": {
      backgroundColor: colors.bgPanel,
      color: colors.text,
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(255, 179, 64, 0.2)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "rgba(255, 179, 64, 0.4)",
    },
  },
  { dark: true },
);

// Maps directly onto the tokenColor() function from your mockup:
// kw/tag → cyan, fn/attr → green, str → amber, num/bool → coral,
// comment → faint slate, dim/punctuation → dim slate, plain → main text.
export const framecodeHighlightStyle = HighlightStyle.define([
  {
    tag: [
      t.keyword,
      t.controlKeyword,
      t.operatorKeyword,
      t.definitionKeyword,
      t.moduleKeyword,
    ],
    color: colors.cyan,
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: colors.green,
  },
  { tag: t.propertyName, color: colors.green },
  { tag: t.attributeName, color: colors.green },
  { tag: [t.string, t.special(t.string)], color: colors.amber },
  { tag: t.attributeValue, color: colors.amber },
  { tag: [t.number, t.bool, t.atom], color: colors.coral },
  { tag: t.tagName, color: colors.cyan },
  {
    tag: [t.comment, t.lineComment, t.blockComment],
    color: colors.faint,
    fontStyle: "italic",
  },
  {
    tag: [
      t.punctuation,
      t.bracket,
      t.angleBracket,
      t.operator,
      t.separator,
      t.derefOperator,
    ],
    color: colors.dim,
  },
  { tag: [t.variableName, t.name], color: colors.text },
  { tag: [t.typeName, t.className], color: colors.cyan },
  { tag: t.invalid, color: colors.coral, textDecoration: "underline wavy" },
]);

// Drop this into your editor's extensions array in place of oneDark.
export const framecodeCM = [
  framecodeTheme,
  syntaxHighlighting(framecodeHighlightStyle),
];
