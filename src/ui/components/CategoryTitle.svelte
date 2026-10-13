<!--
  CategoryTitle.svelte — Titre d'une catégorie de boutons
-->
<script lang="ts">
  import type { Category } from '../../types.ts';

  let { cat }: { cat: Category<unknown> } = $props();
</script>

<div class="cat-title" style:--cat-color={cat.color ?? 'var(--text-muted)'}>{`${cat.icon ?? ''} ${cat.label}`}</div>
