<script lang="ts">
  export type Node = {
    name: string;
    path: string;
    type: 'blob' | 'tree';
    children: Node[];
  };

  export let node: Node;
  export let expanded: Set<string>;
  export let onOpenFile: (node: Node) => void;
  export let onToggle: (path: string) => void;

  $: isOpen = expanded.has(node.path);
</script>

<li>
  {#if node.type === 'tree'}
    <button class="row folder" on:click={() => onToggle(node.path)}>
      <span class="icon">{isOpen ? '▾' : '▸'}</span>
      {node.name}
    </button>
    {#if isOpen}
      <ul class="children">
        {#each node.children as child (child.path)}
          <svelte:self node={child} {expanded} {onOpenFile} {onToggle} />
        {/each}
      </ul>
    {/if}
  {:else}
    <button class="row file" on:click={() => onOpenFile(node)}>
      <span class="icon">·</span>
      {node.name}
    </button>
  {/if}
</li>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #b3b3b3;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    padding: 2px 4px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    border-radius: 3px;
  }
  .row:hover {
    color: #00e5a0;
    background: rgba(0, 229, 160, 0.06);
  }
  .icon {
    display: inline-block;
    width: 12px;
    opacity: 0.6;
  }
  .children {
    margin: 0 0 0 10px;
    padding-left: 8px;
    list-style: none;
    border-left: 1px solid #222;
  }
</style>