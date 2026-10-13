<!--
  CategoryTitle.svelte — Titre d'une catégorie de boutons
-->
<script lang="ts">
  import type { Category } from '../../types.ts';

  let { cat }: { cat: Category<unknown> } = $props();
</script>

<div class="cat-title" style:--cat-color={cat.color ?? 'var(--text-muted)'}>{`${cat.icon ?? ''} ${cat.label}`}</div>

<style>
  .cat-title {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--cat-color, var(--text-muted));
    text-transform: uppercase;
    padding: 2px 4px;
    opacity: 0.9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
