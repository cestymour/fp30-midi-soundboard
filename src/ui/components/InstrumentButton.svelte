<!--
  InstrumentButton.svelte — Tuile d'un instrument (onglets piano) : un clic envoie son patch
  au piano, et la tuile reste allumée tant que c'est l'instrument actif.
  Aspect et styles : Tile.svelte.
-->
<script lang="ts">
  import type { MidiItem } from '../../types.ts';
  import { instruments, selectInstrument } from '../midi-ui.svelte.ts';
  import Tile from './Tile.svelte';

  let { item }: { item: MidiItem } = $props();
</script>

<Tile
  class={'inst-btn' + (item.catClass ? ' ' + item.catClass : '')}
  states={{ active: instruments.active === item }}
  title={item.title ?? item.name}
  onclick={() => selectInstrument(item)}
  svg={item.svg}
  emoji={item.icon}
  name={item.name}
/>
