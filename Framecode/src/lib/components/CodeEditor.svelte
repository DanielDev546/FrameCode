<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorState } from '@codemirror/state';
  import { EditorView, basicSetup } from 'codemirror';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { languageForFile } from '$lib/utils/languageForFile';

  // Initial content for the file being opened. This is only read when the
  // editor is (re)created — after that, CodeMirror owns the text, so don't
  // rely on `value` to reactively push updates into an already-open editor.
  export let value = '';
  export let filename = '';
  export let readOnly = false;

  const dispatch = createEventDispatcher<{ change: string }>();

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
        oneDark,
        ...(language ? [language] : []),
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            dispatch('change', update.state.doc.toString());
          }
        })
      ]
    });

    view = new EditorView({ state, parent: container });
    currentFilename = filename;
  }

  onMount(createEditor);

  // Re-creates the editor when a *different* file is opened (new filename).
  // Simpler than swapping language extensions live via Compartments, and
  // fine for a "click a file in the tree, it opens" workflow.
  $: if (view && filename && filename !== currentFilename) {
    createEditor();
  }

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