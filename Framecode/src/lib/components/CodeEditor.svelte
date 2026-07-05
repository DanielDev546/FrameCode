<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorState } from '@codemirror/state';
  import { EditorView, basicSetup } from 'codemirror';
  import { framecodeCM } from '$lib/editor/framecodeTheme';
  import { languageForFile } from '$lib/utils/languageForFile';

  // `value` only seeds the doc when the editor is (re)created — CodeMirror
  // owns the text after that, so don't rely on it to push live updates in.
  let {
    value = '',
    filename = '',
    readOnly = false,
    onChange = () => {}
  }: {
    value?: string;
    filename?: string;
    readOnly?: boolean;
    onChange?: (content: string) => void;
  } = $props();

  let container: HTMLDivElement;
  let view: EditorView | null = null;
  let currentFilename = '';

  async function createEditor() {
    view?.destroy();

    const language = await languageForFile(filename);

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        ...framecodeCM,
        ...(language ? [language] : []),
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        })
      ]
    });

    view = new EditorView({ state, parent: container });
    currentFilename = filename;
  }

  onMount(createEditor);

  // Re-creates the editor when a *different* file is opened.
  $effect(() => {
    if (view && filename && filename !== currentFilename) {
      createEditor();
    }
  });

  onDestroy(() => view?.destroy());
</script>

<div class="editor" bind:this={container}></div>

<style>
  .editor {
    height: 100%;
    width: 100%;
    overflow: auto;
  }
  :global(.cm-editor) {
    height: 100%;
    font-size: 13px;
  }
  :global(.cm-scroller) {
    font-family: 'JetBrains Mono', monospace;
  }
</style>